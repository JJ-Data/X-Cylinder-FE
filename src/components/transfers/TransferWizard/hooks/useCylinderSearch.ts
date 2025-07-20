import React, { useState, useCallback } from 'react'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import type { Cylinder } from '@/types/cylinder'

export const useCylinderSearch = () => {
    const [isSearching, setIsSearching] = useState(false)
    const [selectedCylinder, setSelectedCylinder] = useState<Cylinder | null>(null)
    const [cylinderSearch, setCylinderSearch] = useState('')

    const fetchCylinder = useCallback(async (searchValue: string) => {
        setIsSearching(true)
        try {
            const response = await fetch(
                `/api/proxy/cylinders/code/${searchValue}`,
            )

            if (response.ok) {
                const data = await response.json()
                const cylinder = data.data

                if (cylinder.status === 'leased') {
                    toast.push(
                        React.createElement(Notification, {
                            title: 'Error',
                            type: 'danger'
                        }, 'Cannot transfer a leased cylinder')
                    )
                    return null
                }

                if (cylinder.status === 'damaged') {
                    toast.push(
                        React.createElement(Notification, {
                            title: 'Error',
                            type: 'danger'
                        }, 'Cannot transfer a damaged cylinder')
                    )
                    return null
                }

                setSelectedCylinder(cylinder)
                return cylinder
            } else {
                toast.push(
                    React.createElement(Notification, {
                        title: 'Error',
                        type: 'danger'
                    }, 'Cylinder not found')
                )
                return null
            }
        } catch {
            toast.push(
                React.createElement(Notification, {
                    title: 'Error',
                    type: 'danger'
                }, 'Error searching for cylinder')
            )
            return null
        } finally {
            setIsSearching(false)
        }
    }, [])

    const handleSearch = useCallback(async () => {
        if (!cylinderSearch.trim()) {
            toast.push(
                React.createElement(Notification, {
                    title: 'Error',
                    type: 'danger'
                }, 'Please enter a cylinder code')
            )
            return
        }
        await fetchCylinder(cylinderSearch)
    }, [cylinderSearch, fetchCylinder])

    const clearSearch = useCallback(() => {
        setSelectedCylinder(null)
        setCylinderSearch('')
    }, [])

    return {
        isSearching,
        selectedCylinder,
        setSelectedCylinder,
        cylinderSearch,
        setCylinderSearch,
        fetchCylinder,
        handleSearch,
        clearSearch,
    }
}