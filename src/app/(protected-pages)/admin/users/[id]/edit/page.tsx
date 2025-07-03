'use client'

import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import Container from '@/components/shared/Container'
import UserForm from '@/components/users/UserForm'
import { useUser, useUserMutations } from '@/hooks/useUsers'
import { type UpdateUserDto } from '@/types/user'
import { HiArrowLeft } from 'react-icons/hi'
import Button from '@/components/ui/Button'
import Skeleton from '@/components/ui/Skeleton'
import Card from '@/components/ui/Card'

export default function EditUserPage() {
    const router = useRouter()
    const params = useParams()
    const userId = parseInt(params.id as string)

    const { data: user, isLoading } = useUser(userId)
    const { updateUser } = useUserMutations()

    const handleSubmit = async (data: UpdateUserDto) => {
        try {
            await updateUser.trigger({ id: userId, data })
            router.push('/admin/users')
        } catch (error) {
            console.error('Failed to update user:', error)
        }
    }

    if (isLoading) {
        return (
            <Container>
                <div className="mb-6">
                    <Skeleton width={200} height={32} />
                    <Skeleton width={300} height={20} className="mt-2" />
                </div>
                <Card>
                    <Skeleton height={400} />
                </Card>
            </Container>
        )
    }

    if (!user) {
        return (
            <Container>
                <div className="text-center py-12">
                    <p className="text-gray-500">User not found</p>
                    <Button
                        variant="plain"
                        onClick={() => router.push('/admin/users')}
                        className="mt-4"
                    >
                        Back to Users
                    </Button>
                </div>
            </Container>
        )
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

                <h3 className="mb-1 mt-4">Edit User</h3>
                <p className="text-sm text-gray-500">
                    Update user information for {user.firstName} {user.lastName}
                </p>
            </div>

            <UserForm
                user={user}
                onSubmit={handleSubmit}
                isSubmitting={updateUser.isMutating}
            />
        </Container>
    )
}
