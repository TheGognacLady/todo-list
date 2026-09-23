import {
  changeThemeModeAC,
  selectAppStatus,
  selectIsLoggedIn,
  selectThemeMode,
  setIsLoggedInAC,
} from "@/app/app-slice.ts"
import { NavButton } from "@/common/components/NavButton/NavButton"
import { AUTH_TOKEN } from "@/common/constants"
import { ResultCode } from "@/common/enums"
import { useAppDispatch, useAppSelector } from "@/common/hooks"
import { containerSx } from "@/common/styles"
import { useLogoutMutation } from "@/features/auth/api/authApi"
import AppBar from "@mui/material/AppBar"
import Container from "@mui/material/Container"
import LinearProgress from "@mui/material/LinearProgress"
import Switch from "@mui/material/Switch"
import Toolbar from "@mui/material/Toolbar"
import { baseApi } from "@/app/baseApi.ts"

export const Header = () => {
  const isLoggedIn = useAppSelector(selectIsLoggedIn)
  const themeMode = useAppSelector(selectThemeMode)
  const status = useAppSelector(selectAppStatus)

  const [logout] = useLogoutMutation()

  const dispatch = useAppDispatch()

  const changeMode = () => {
    dispatch(changeThemeModeAC({ themeMode: themeMode === "light" ? "dark" : "light" }))
  }

  const logoutHandler = () => {
    logout().then((res) => {
      if (res.data?.resultCode === ResultCode.Success) {
        dispatch(setIsLoggedInAC({ isLoggedIn: false }))
        localStorage.removeItem(AUTH_TOKEN)
      }
    })
      .then(()=> {
        dispatch(baseApi.util.invalidateTags(['Todolist', 'Task']))
      })
  }

  return (
    <AppBar position="static" sx={{ mb: "30px" }}>
      <Toolbar>
        <Container maxWidth={"lg"} sx={{ ...containerSx, justifyContent: "flex-end" }}>
          <div>
            {isLoggedIn && <NavButton onClick={logoutHandler}>Sign out</NavButton>}
            <Switch color={"default"} onChange={changeMode} />
          </div>
        </Container>
      </Toolbar>
      {status === "loading" && <LinearProgress />}
    </AppBar>
  )
}
