import { Suspense } from "react"

import { SignupClient } from "@/app/signup/signup-client"

export default function SignupPage() {
  return (
    <Suspense>
      <SignupClient />
    </Suspense>
  )
}

