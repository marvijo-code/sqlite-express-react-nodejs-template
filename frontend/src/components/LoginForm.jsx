import { useState } from "react"
import axios from "axios"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Toast, ToastProvider, ToastViewport, ToastTitle, ToastDescription } from "./ui/toast"

const formSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
})

export function LoginForm() {
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [isError, setIsError] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(formSchema),
  })

  const onSubmit = async (data) => {
    try {
      const response = await axios.post('http://localhost:3000/api/login', data)
      setToastMessage(response.data.message)
      setIsError(false)
      setShowToast(true)
    } catch (error) {
      setToastMessage(error.response?.data?.error || "Login failed")
      setIsError(true)
      setShowToast(true)
    }
  }

  return (
    <ToastProvider>
      <div className="w-full max-w-md mx-auto space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Login</h1>
          <p className="text-gray-500">Enter your credentials to access your account</p>
          <div className="bg-yellow-100 p-4 rounded-md">
            <p className="text-yellow-800">Demo credentials:</p>
            <p className="font-mono">username: 'user'</p>
            <p className="font-mono">password: '$user$'</p>
          </div>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="Enter your username"
              {...register("username")}
            />
            {errors.username && (
              <p className="text-sm text-red-500">{errors.username.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full">
            Login
          </Button>
        </form>
      </div>

      {showToast && (
        <Toast
          variant={isError ? "destructive" : "default"}
          onOpenChange={() => setShowToast(false)}
        >
          <ToastTitle>{isError ? "Error" : "Success"}</ToastTitle>
          <ToastDescription>{toastMessage}</ToastDescription>
        </Toast>
      )}
      <ToastViewport />
    </ToastProvider>
  )
}
