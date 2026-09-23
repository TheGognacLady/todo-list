import { beforeEach, describe, expect, it, vi } from "vitest"
import type { BaseQueryApi, FetchBaseQueryError } from "@reduxjs/toolkit/query/react"
import { ResultCode } from "@/common/enums"
import { handleError } from "@/common/utils/handleError"

// Isolate this utility from the store and its API modules.
vi.mock("@/app/app-slice", () => ({
  setAppErrorAC: (payload: { error: string }) => ({ type: "app/setAppErrorAC", payload }),
}))

const dispatch = vi.fn<BaseQueryApi["dispatch"]>()
const api: BaseQueryApi = {
  dispatch,
  signal: new AbortController().signal,
  abort: vi.fn(),
  getState: () => ({}),
  extra: undefined,
  endpoint: "test",
  type: "query",
}

const expectError = (message: string) => {
  expect(dispatch).toHaveBeenCalledExactlyOnceWith({
    type: "app/setAppErrorAC",
    payload: { error: message },
  })
}

describe("handleError", () => {
  beforeEach(() => vi.clearAllMocks())

  it.each([404, 405])("handles HTTP %i without data or a resultCode crash", (status) => {
    const error = { status, data: "Not found" }
    expect(() => handleError(api, { error })).not.toThrow()
    expectError(JSON.stringify(error))
  })

  it.each([500, 503])("shows a readable message for HTTP %i", (status) => {
    handleError(api, { error: { status, data: "Server failure" } })
    expectError("Server error occurred. Please try again later.")
  })

  it.each<Extract<FetchBaseQueryError, { error: string }>>([
    { status: "FETCH_ERROR", error: "Failed to fetch" },
    { status: "TIMEOUT_ERROR", error: "Request timed out" },
    { status: "PARSING_ERROR", originalStatus: 404, data: "<html>Not found</html>", error: "Invalid JSON" },
    { status: "CUSTOM_ERROR", error: "Custom failure" },
  ])("handles $status without response data", (error) => {
    handleError(api, { error })
    expectError(error.error)
  })

  it("uses the server message for HTTP 400", () => {
    handleError(api, { error: { status: 400, data: { message: "Invalid title" } } })
    expectError("Invalid title")
  })

  it("handles HTTP 400 with an unfamiliar response body", () => {
    handleError(api, { error: { status: 400, data: { details: ["Invalid title"] } } })
    expectError(JSON.stringify({ details: ["Invalid title"] }))
  })

  it("shows the first business-error message", () => {
    handleError(api, { data: { resultCode: ResultCode.Error, messages: ["Invalid task", "Other error"] } })
    expectError("Invalid task")
  })

  it.each([{}, { messages: [] }, { messages: null }, { messages: "Unexpected" }, { messages: [123] }])(
    "uses a fallback when a business error has no usable message: %j",
    (fields) => {
      handleError(api, { data: { resultCode: ResultCode.Error, ...fields } })
      expectError("Some error occurred")
    },
  )

  it.each([undefined, null, {}, [], "Unexpected", { resultCode: ResultCode.Success, messages: [] }])(
    "does not crash or show an error for data %j",
    (data) => {
      expect(() => handleError(api, { data })).not.toThrow()
      expect(dispatch).not.toHaveBeenCalled()
    },
  )
})
