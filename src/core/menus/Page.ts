export interface Page<T> {
    /**
     * Load your HTML into the children of this element.
     * @param element The element to load children into.
     */
    load(element: HTMLElement, state: T): void;

    /**
     * Load your localState into the page.
     * @param state The globalState to add local state to.
     */
    init(state: T): void;

    /**
     * If the transition to the next page is valid.
     * @param nextPage The ID of the next page.
     */
    canTransition(nextPage: string): boolean;

    cleanup(state: T): void;
}
