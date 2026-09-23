import { describe, expect, it } from "vitest"
import { TaskPriority, TaskStatus } from "@/common/enums"
import type { DomainTask } from "@/features/todolists/api/tasksApi.types"
import { createTaskModel } from "@/features/todolists/lib/utils/createTaskModel"

const makeTask = (): DomainTask => ({
  id: "task-1",
  todoListId: "list-1",
  title: "Read a book",
  description: "Chapter one",
  status: TaskStatus.InProgress,
  priority: TaskPriority.Hi,
  startDate: "2026-09-01T10:00:00",
  deadline: "2026-09-30T10:00:00",
  addedDate: "2026-08-31T10:00:00",
  order: 1,
})

describe("createTaskModel", () => {
  it("changes the title while preserving the other editable fields", () => {
    expect(createTaskModel(makeTask(), { title: "Read chapter two" })).toEqual({
      title: "Read chapter two",
      description: "Chapter one",
      status: TaskStatus.InProgress,
      priority: TaskPriority.Hi,
      startDate: "2026-09-01T10:00:00",
      deadline: "2026-09-30T10:00:00",
    })
  })

  it("can reset status and priority to zero without losing the title", () => {
    const result = createTaskModel(makeTask(), { status: TaskStatus.New, priority: TaskPriority.Low })
    expect(result.status).toBe(TaskStatus.New)
    expect(result.priority).toBe(TaskPriority.Low)
    expect(result.title).toBe("Read a book")
  })

  it("allows clearing nullable fields", () => {
    const result = createTaskModel(makeTask(), { description: null, startDate: null, deadline: null })
    expect(result).toMatchObject({ description: null, startDate: null, deadline: null })
  })

  it("does not include server-only fields in the update payload", () => {
    const result = createTaskModel(makeTask(), {})
    expect(result).not.toHaveProperty("id")
    expect(result).not.toHaveProperty("todoListId")
    expect(result).not.toHaveProperty("addedDate")
    expect(result).not.toHaveProperty("order")
    expect(result.title).toBe("Read a book")
  })

  it("does not mutate the task or the requested changes", () => {
    const task = makeTask()
    const original = { ...task }
    const changes = { title: "New title" }
    const result = createTaskModel(task, changes)
    result.title = "Changed afterwards"
    expect(task).toEqual(original)
    expect(changes).toEqual({ title: "New title" })
  })
})
