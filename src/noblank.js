/**
 * @param {Node | EventTarget} someNode
 * @returns {someNode is HTMLAnchorElement | HTMLAreaElement}
 */
function isLinkWithBlankTarget(someNode) {
    return (
        (someNode instanceof HTMLAnchorElement ||
            someNode instanceof HTMLAreaElement) &&
        someNode.target.includes("_blank")
    );
}

/**
 * @param {Event | MouseEvent | TouchEvent | KeyboardEvent} ev
 */
function noblank(ev) {
    const { currentTarget: el } = ev;
    if (!el || !isLinkWithBlankTarget(el)) {
        return;
    }
    console.info('Removing target="_blank" from clicked link:', el);
    el.removeAttribute("target");
}

const linkObserver = new MutationObserver(function handleAttributeChanges(
    mutations
) {
    for (const m of mutations) {
        if (m.attributeName === "target") {
            const el = m.target;
            if (isLinkWithBlankTarget(el)) {
                console.info('target="_blank" added to link, removing...', el);
                el.removeAttribute("target");
            }
        }
    }
});

/**
 * @param {HTMLAnchorElement | HTMLAreaElement} anchor
 */
function attachInteractionListenersToAnchor(anchor) {
    anchor.addEventListener("mousedown", noblank);
    anchor.addEventListener("touchstart", noblank);
    anchor.addEventListener("keydown", noblank);
    linkObserver.observe(anchor, {
        attributeFilter: ["target"],
    });
}

/**
 * @param {Element} element
 */
function attachInteractionListenersToAnchorsInTree(element) {
    if (isLinkWithBlankTarget(element)) {
        console.info("Parent element is a link, attaching listeners:", element);
        attachInteractionListenersToAnchor(element);
    }

    /**
     * @type {NodeListOf<HTMLAnchorElement | HTMLAreaElement>}
     */
    const childAnchorLinks = element.querySelectorAll(
        'a[target*="_blank"],area[target*="_blank"]'
    );

    if (childAnchorLinks.length > 0) {
        console.info(
            `${childAnchorLinks.length} target="_blank" links found in subtree, attaching listeners:`,
            childAnchorLinks
        );
    }

    for (const anchor of childAnchorLinks) {
        attachInteractionListenersToAnchor(anchor);
    }
}

attachInteractionListenersToAnchorsInTree(document.body);

const bodyObserver = new MutationObserver(function handleMutations(mutations) {
    for (const m of mutations) {
        for (const node of m.addedNodes) {
            if (node instanceof Element) {
                attachInteractionListenersToAnchorsInTree(node);
            }
        }
    }
});

bodyObserver.observe(document.body, {
    childList: true, // listen for added child nodes
    subtree: true, // listen for added child nodes anywhere in the tree
});
