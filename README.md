# bookmark-search
An extension for searching and manage your bookmarks.
> Bootstrapped with [Create React App](https://github.com/facebook/create-react-app) and [semi.design](https://semi.design/zh-CN)

## Installation
### For Chrome users
Install in Chrome Web Store directly: [link](https://chrome.google.com/webstore/detail/bookmark-search/dhnahdpjgnphiglnbijfoafjdokkbclk)

### For Edge users
> Refer to [Microsoft official doc](https://support.microsoft.com/en-us/microsoft-edge/add-turn-off-or-remove-extensions-in-microsoft-edge-9c0ec68c-2fbc-2f2c-9ff0-bdc76f46b026) 
1. In Edge, go to the [Chrome Web Store](https://chrome.google.com/webstore/detail/bookmark-search/Fdhnahdpjgnphiglnbijfoafjdokkbclk) .
2. Select Allow extensions from other stores in the banner at the top of the page, then select Allow to confirm.
3. Go to [bookmark-search install page](https://chrome.google.com/webstore/detail/bookmark-search/dhnahdpjgnphiglnbijfoafjdokkbclk) and select Add to Chrome.

## Overview
![main](assests/bookmark-search-main-new.jpg)
![item](assests/bookmark-search-item-new.jpg)

## Release
### v1.2.2
- Description: optmize doc
- PR: https://github.com/hj24/bookmark-search/pull/16

### v1.2.1
- Description: fix bug, filter folder correctly for imported bookmarks
- Issue: https://github.com/hj24/bookmark-search/issues/9
- PR: https://github.com/hj24/bookmark-search/pull/15

### v1.2.0
- Description: support shortcut (Ctrl/Command + Shift + S) to open extension popup
- Issue: https://github.com/hj24/bookmark-search/issues/12
- PR: https://github.com/hj24/bookmark-search/pull/13

### v1.1.0
- Description: support real time search on input change
- Issue: https://github.com/hj24/bookmark-search/issues/10
- PR: https://github.com/hj24/bookmark-search/pull/8

### v1.0.0
- Description: Refactor UI theme
- PR: https://github.com/hj24/bookmark-search/pull/7

### v0.9.0
- Description: Initial features, white-black theme
- PR: https://github.com/hj24/bookmark-search/pull/4

## Development
1. `yarn fixlint`
2. `yarn test`
3. `yarn build`
4. Open the build dir in chrome extension
5. Please follow [Conventional Commits specification](https://www.conventionalcommits.org/en/v1.0.0/) to submit PR 
