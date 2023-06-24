import React from 'react';
import {render, screen} from '@testing-library/react';
import App from './App';

jest.mock('./components/icons/Bulleye', () => {
    return {
        __esModule: true,
        SvgBulleye: () => {
            return <div></div>;
        },
        default: () => {
            return <div></div>;
        },
    };
});

jest.mock('./components/icons/Bookmark', () => {
    return {
        __esModule: true,
        SvgBookmark: () => {
            return <div></div>;
        },
        default: () => {
            return <div></div>;
        },
    };
});

jest.mock('@douyinfe/semi-ui/lib/es/locale/source/en_GB', () => {
    return {
        __esModule: true,
        en_GB: undefined,
    };
});

jest.mock('./pages/popup/search', () => {
    return {
        __esModule: true,
        Search: () => {
            return <div></div>;
        },
        default: () => {
            return <div></div>;
        },
    };
});

test('dry render app', () => {
    render(<App />);
    const linkElement = screen.getByText(/Search Bookmarks/i);
    expect(linkElement).toBeInTheDocument();
});
