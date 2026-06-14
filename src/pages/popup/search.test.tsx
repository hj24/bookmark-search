import React, {useEffect} from 'react';
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react';
import Search from './search';

jest.mock('@douyinfe/semi-icons', () => ({
    IconChevronDownStroked: () => <span />,
    IconSearch: () => <span />,
}));

jest.mock('../../utils/log', () => ({
    Logger: jest.fn().mockImplementation(() => ({
        debug: jest.fn(),
        error: jest.fn(),
        info: jest.fn(),
        warning: jest.fn(),
    })),
}));

jest.mock('@douyinfe/semi-ui', () => ({
    Button: ({children, onClick}: any) => <button onClick={onClick}>{children}</button>,
    Divider: ({children}: any) => <div>{children}</div>,
    Input: React.forwardRef(function MockInput(
        {onChange, onClear, onEnterPress, showClear, value = ''}: any,
        ref: any,
    ) {
        return (
            <div>
                <input
                    aria-label="bookmark-search-input"
                    ref={ref}
                    value={value}
                    onChange={e => onChange?.(e.target.value, e)}
                    onKeyDown={e => {
                        if (e.key === 'Enter') {
                            onEnterPress?.(e);
                        }
                    }}
                />
                {showClear && value ? (
                    <button
                        aria-label="clear search"
                        onMouseDown={e => {
                            onChange?.('', e);
                            onClear?.(e);
                        }}>
                        clear
                    </button>
                ) : null}
            </div>
        );
    }),
    List: ({dataSource, renderItem, emptyContent}: any) => (
        <div>
            {dataSource.length === 0 ? (
                <div>{emptyContent}</div>
            ) : (
                dataSource.map((item: any, index: number) => (
                    <React.Fragment key={item.id ?? index}>{renderItem(item, index)}</React.Fragment>
                ))
            )}
        </div>
    ),
    Spin: () => <div>loading</div>,
    Toast: {
        error: jest.fn(),
        warning: jest.fn(),
    },
}));

jest.mock('react-infinite-scroller', () => ({
    __esModule: true,
    default: function MockInfiniteScroll({children, hasMore, loadMore}: any) {
        useEffect(() => {
            if (hasMore) {
                loadMore();
            }
        }, [hasMore, loadMore]);

        return <div>{children}</div>;
    },
}));

jest.mock('../../components/thread/item', () => ({
    ThreadItem: ({item}: any) => <div>{item.title}</div>,
}));

const recentBookmarks = [
    {
        id: 'recent-1',
        parentId: 'root',
        title: 'Recent One',
        url: 'https://recent.example',
    },
];

const searchBookmarks = [
    {
        id: 'search-1',
        parentId: 'root',
        title: 'Search One',
        url: 'https://search.example',
    },
];

const mockChromeBookmarks = (searchImpl: jest.Mock) => {
    (global as any).chrome = {
        bookmarks: {
            getRecent: jest.fn((_count, callback) => callback(recentBookmarks)),
            remove: jest.fn(),
            search: searchImpl,
            update: jest.fn(),
        },
    };
};

describe('Search clear behavior', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('clicking showClear resets the current search back to Recent Added', async () => {
        mockChromeBookmarks(jest.fn((_query, callback) => callback(searchBookmarks)));

        render(<Search />);

        const input = screen.getByLabelText('bookmark-search-input');
        await screen.findByText('Recent One');

        fireEvent.change(input, {target: {value: 'abc'}});

        await screen.findByText('Search One');
        expect(screen.getByText('Search Results')).toBeInTheDocument();

        fireEvent.mouseDown(screen.getByLabelText('clear search'));

        await waitFor(() => expect(input).toHaveValue(''));
        expect(screen.getByText('Recent Added')).toBeInTheDocument();
        expect(screen.getByText('Recent One')).toBeInTheDocument();
        expect(screen.queryByText('Search One')).not.toBeInTheDocument();
        expect((global as any).chrome.bookmarks.getRecent).toHaveBeenCalledTimes(1);
    });

    test('late search results are ignored after showClear resets to Recent Added', async () => {
        let resolveSearch: ((items: typeof searchBookmarks) => void) | undefined;
        mockChromeBookmarks(
            jest.fn((_query, callback) => {
                resolveSearch = callback;
            }),
        );

        render(<Search />);

        const input = screen.getByLabelText('bookmark-search-input');
        await screen.findByText('Recent One');

        fireEvent.change(input, {target: {value: 'abc'}});

        await waitFor(() =>
            expect((global as any).chrome.bookmarks.search).toHaveBeenCalledWith('abc', expect.any(Function)),
        );
        fireEvent.mouseDown(screen.getByLabelText('clear search'));

        await waitFor(() => expect(screen.getByText('Recent Added')).toBeInTheDocument());

        act(() => {
            resolveSearch?.(searchBookmarks);
        });

        await waitFor(() => expect(screen.queryByText('Search One')).not.toBeInTheDocument());
        expect(input).toHaveValue('');
        expect(screen.getByText('Recent Added')).toBeInTheDocument();
        expect(screen.getByText('Recent One')).toBeInTheDocument();
    });
});
