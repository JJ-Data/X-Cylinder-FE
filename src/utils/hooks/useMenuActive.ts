 
// eslint-disable  @typescript-eslint/no-explicit-any'use client'
'use client'

import { useMemo } from 'react'
import isPlainObject from 'lodash/isPlainObject'
import type { NavigationTree } from '@/@types/navigation'

interface NavInfo extends NavigationTree {
    parentKey?: string
}

const getRouteInfo = (
    navTree: NavInfo | NavInfo[],
    key: string,
): NavInfo | undefined => {
    if (!Array.isArray(navTree) && navTree.key === key) {
        return navTree
    }
    let activedRoute: NavInfo | undefined
    let isIncludeActivedRoute = false
    for (const p in navTree) {
        if (
            p !== 'icon' &&
            navTree.hasOwnProperty(p) &&
            typeof (navTree as any)[p] === 'object'
        ) {
            if (
                isPlainObject((navTree as any)[p]) &&
                (navTree as any)[p].subMenu?.length > 0
            ) {
                if (
                    (navTree as any)[p].subMenu.some(
                        (el: NavInfo) => el.key === key,
                    )
                ) {
                    isIncludeActivedRoute = true
                }
            }

            activedRoute = getRouteInfo((navTree as any)[p], key)

            if (activedRoute) {
                if (isIncludeActivedRoute) {
                    activedRoute.parentKey = (navTree as any)[p].key
                }

                return activedRoute
            }
        }
    }
    return activedRoute
}

const findNestedRoute = (navTree: NavigationTree[], key: string): boolean => {
    const found = navTree.find((node) => {
        return node.key === key
    })
    if (found) {
        return true
    }
    return navTree.some((c) => findNestedRoute(c.subMenu, key))
}

const getTopRouteKey = (
    navTree: NavigationTree[],
    key: string,
): NavigationTree => {
    let foundNav = {} as NavigationTree
    navTree.forEach((nav) => {
        if (findNestedRoute([nav], key)) {
            foundNav = nav
        }
    })
    return foundNav
}

// Routes that aren't in the nav tree themselves (e.g. a "[id]" detail/edit page
// with key 'admin.cylinders.detail') fall back to their nearest ancestor key
// ('admin.cylinders.detail' -> 'admin.cylinders') so the sidebar still highlights
// the right section instead of showing nothing active.
const resolveNavKey = (navTree: NavigationTree[], key: string): string => {
    let lookupKey = key
    while (lookupKey) {
        if (getRouteInfo(navTree, lookupKey) || findNestedRoute(navTree, lookupKey)) {
            return lookupKey
        }
        const lastDot = lookupKey.lastIndexOf('.')
        if (lastDot === -1) break
        lookupKey = lookupKey.slice(0, lastDot)
    }
    return key
}

function useMenuActive(navTree: NavigationTree[], key: string) {
    const resolvedKey = useMemo(
        () => resolveNavKey(navTree, key),
        [navTree, key],
    )

    const activedRoute = useMemo(() => {
        const route = getRouteInfo(navTree, resolvedKey)
        return route
    }, [navTree, resolvedKey])

    const includedRouteTree = useMemo(() => {
        const included = getTopRouteKey(navTree, resolvedKey)
        return included
    }, [navTree, resolvedKey])

    return { activedRoute, includedRouteTree }
}

export default useMenuActive
