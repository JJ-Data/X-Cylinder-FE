'use server'

import type { SignUpCredential } from '@/@types/auth'

export const onSignUpWithCredentials = async ({
    email,
    firstName,
    lastName,
}: SignUpCredential) => {
    try {
        /** Pretend create user */
        const userName = `${firstName} ${lastName}`
        return {
            email,
            userName,
            id: email, // Using email as temporary ID
        }
    } catch (error) {
        throw error
    }
}
