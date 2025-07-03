'use client'

import { useRouter } from 'next/navigation'
import Container from '@/components/shared/Container'
import UserForm from '@/components/users/UserForm'
import { useUserMutations } from '@/hooks/useUsers'
import { type CreateUserDto, type UpdateUserDto } from '@/types/user'
import { HiArrowLeft } from 'react-icons/hi'
import Button from '@/components/ui/Button'

export default function CreateUserPage() {
    const router = useRouter()
    const { createUser } = useUserMutations()

    const handleSubmit = async (data: CreateUserDto | UpdateUserDto) => {
        try {
            await createUser.trigger(data as CreateUserDto)
            router.push('/admin/users')
        } catch (error) {
            console.error('Failed to create user:', error)
        }
    }

    return (
        <Container>
            <div className="mb-6">
                <Button
                    size="sm"
                    variant="plain"
                    icon={<HiArrowLeft />}
                    onClick={() => router.push('/admin/users')}
                >
                    Back to Users
                </Button>

                <h3 className="mb-1 mt-4">Create New User</h3>
                <p className="text-sm text-gray-500">
                    Add a new user to the system
                </p>
            </div>

            <UserForm
                onSubmit={handleSubmit}
                isSubmitting={createUser.isMutating}
            />
        </Container>
    )
}
