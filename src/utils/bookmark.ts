export const isFolder = (bookmark: chrome.bookmarks.BookmarkTreeNode): boolean => {
    if (!bookmark.url) {
        return true;
    }
    return false;
};
