export type storeType = {
    message: string | null;
    todos: { id: number; title: string; background: string | null }[];
};

export type actionType = {
    type: 'set_hello' | 'add_task';
    payload?: any;
};

export const initialStore = (): storeType => {
    return {
        message: null,
        todos: [
            {
                id: 1,
                title: 'Make the bed',
                background: null,
            },
            {
                id: 2,
                title: 'Do my homework',
                background: null,
            },
        ],
    };
};

export default function storeReducer(
    store: storeType,
    action: { type: string; payload?: any }
): storeType {
    switch (action.type) {
        case 'set_hello':
            return {
                ...store,
                message: action.payload,
            };

        case 'add_task':
            const { id, color } = action.payload;

            return {
                ...store,
                todos: store.todos.map(todo =>
                    todo.id === id ? { ...todo, background: color } : todo
                ),
            };
        default:
            throw Error('Unknown action.');
    }
}
