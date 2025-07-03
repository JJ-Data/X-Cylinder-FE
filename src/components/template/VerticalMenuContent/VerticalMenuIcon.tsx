import navigationIcon from '@/configs/navigation-icon.config'
import type { ElementType, ComponentPropsWithRef, ReactElement } from 'react'
import { isValidElement } from 'react'

type VerticalMenuIconProps = {
    icon: string | ReactElement | React.ReactNode
    gutter?: string
}

export const Icon = <T extends ElementType>({
    component,
    ...props
}: {
    header: T
} & ComponentPropsWithRef<T>) => {
    const Component = component
    return <Component {...props} />
}

const VerticalMenuIcon = ({ icon }: VerticalMenuIconProps) => {
    if (!icon) {
        return <></>
    }

    // Handle React component icons (current CylinderX pattern)
    if (isValidElement(icon)) {
        return <span className="text-2xl">{icon}</span>
    }

    // Handle string-based icon references (demo pattern)
    if (typeof icon === 'string' && navigationIcon[icon]) {
        return <span className="text-2xl">{navigationIcon[icon]}</span>
    }

    return <></>
}

export default VerticalMenuIcon
