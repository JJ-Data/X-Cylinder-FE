'use client'

import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import SignUp from '@/components/auth/SignUp'
import { apiSignUp } from '@/services/AuthService'
import { useRouter } from 'next/navigation'
import type { OnSignUpPayload } from '@/components/auth/SignUp'

const SignUpClient = () => {
    const router = useRouter()

    const handlSignUp = async ({
        values,
        setSubmitting,
        setMessage,
    }: OnSignUpPayload) => {
        try {
            setSubmitting(true)
            const response = await apiSignUp(values)
            
            if (response.success) {
                toast.push(
                    <Notification title="Account created!" type="success">
                        Please check your email to verify your account. You can now sign in.
                    </Notification>,
                )
                router.push('/sign-in')
            } else {
                setMessage(response.message || 'Failed to create account')
            }
        } catch (error: any) {
            setMessage(error?.response?.data?.error || error?.message || 'An error occurred')
        } finally {
            setSubmitting(false)
        }
    }

    return <SignUp onSignUp={handlSignUp} />
}

export default SignUpClient
