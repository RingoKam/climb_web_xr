export const getChangesValue = (changes) => {
    return changes.reduce((acc,cur) => {
        acc[cur.field] = cur.value
        return acc
    }, {})
}