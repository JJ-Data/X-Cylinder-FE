// Drop-in replacement for the `{ toast }` API from 'react-hot-toast' / 'sonner',
// backed by the app's actual working toast system (@/components/ui/toast +
// Notification). Neither react-hot-toast's nor sonner's <Toaster/> is mounted
// anywhere in this app, so every toast.success()/toast.error() call through
// those libraries was a silent no-op. Swapping the import to this module keeps
// every existing call site working unchanged - the bare `toast(msg)` form,
// `toast.success(msg)`, `toast.error(msg, options)`, all of it.
import toastEngine from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import type { ReactNode } from 'react'

interface ToastOptions {
    duration?: number
    // Accepted for call-site compatibility with react-hot-toast/sonner options
    // (icon, position, id, ...) - not used by this app's Notification component.
    [key: string]: unknown
}

function push(
    type: 'success' | 'danger' | 'info',
    title: string,
    message: ReactNode,
    options?: ToastOptions,
) {
    return toastEngine.push(
        <Notification title={title} type={type} duration={options?.duration}>
            {message}
        </Notification>,
    )
}

function toastFn(message: ReactNode, options?: ToastOptions) {
    return push('info', 'Notice', message, options)
}

toastFn.success = (message: ReactNode, options?: ToastOptions) =>
    push('success', 'Success', message, options)
toastFn.error = (message: ReactNode, options?: ToastOptions) =>
    push('danger', 'Error', message, options)

export const toast = toastFn
export default toast
