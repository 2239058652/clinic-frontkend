/**
 * 清除对象中值为 null, undefined, 空字符串 的属性
 */
export function cleanEmptyParams(obj: Record<string, any>) {
    const result: Record<string, any> = {}
    for (const key in obj) {
        const value = obj[key]
        // 只要不是 null, undefined, 并且不是纯空格的字符串，就保留
        if (value !== null && value !== undefined && value !== '') {
            result[key] = value
        }
    }
    return result
}
