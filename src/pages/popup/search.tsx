import React, {useEffect, useState} from 'react';
import {Button, Divider, Input, List, Spin, Toast} from '@douyinfe/semi-ui';
import {IconChevronDownStroked, IconSearch} from '@douyinfe/semi-icons';
import InfiniteScroll from 'react-infinite-scroller';
import {Bookmark, ThreadItem} from '../../components/thread/item';
import {Logger} from '../../utils/log';
import {isFolder} from '../../utils/bookmark';
import './search.css';

const logger = new Logger('bs.pages.popup.search');
const DEFAULT_PAGE_NUMBER = 5;
const HINT_RECENT_ADDED = 'Recent Added';
const HINT_SEARCH_RESULTS = 'Search Results';
const CTX_RECENT_ADDED = 0;
const CTX_SEARCH = 1;

const Search: React.FC = () => {
    const [query, setQuery] = useState('');
    // 搜索结果相关
    const [recent, setRecent] = useState<Bookmark[]>([]);
    const [search, setSearch] = useState<Bookmark[]>([]);
    // thread 相关
    const [threadSource, setThreadSource] = useState<Bookmark[]>([]);
    const [thread, setThread] = useState<Bookmark[]>([]);
    const [threadHint, setThreadHint] = useState(HINT_RECENT_ADDED);
    const [threadCursor, setThreadCursor] = useState(0);
    const [threadLoading, setThreadLoading] = useState(false);
    const [threadFetchCnt, setThreadFetchCnt] = useState(0);
    const [threadRefresh, setThreadRefresh] = useState(false);
    const [threadContext, setThreadContext] = useState(CTX_RECENT_ADDED);

    const promiseLoadRecentAdded = () => {
        return new Promise((resolve, reject) => {
            try {
                chrome.bookmarks.getRecent(DEFAULT_PAGE_NUMBER, (res: chrome.bookmarks.BookmarkTreeNode[]) => {
                    const recentAdded: Bookmark[] = [];
                    res.forEach((val, ...args) => {
                        // NOTE: 最近添加结果过滤 folder
                        if (isFolder(val)) {
                            return;
                        }
                        recentAdded.push({
                            id: val.id,
                            parentId: val.parentId ? val.parentId : '',
                            title: val.title,
                            url: val.url ? val.url : '',
                        });
                    });
                    setRecent(recentAdded);
                    setThreadSource(recentAdded);
                    logger.debug('recent added: ', recentAdded);
                    resolve(recentAdded);
                });
            } catch (error) {
                logger.error(error);
                // NOTE: 加载最近添加如果失败，降级为提示 waring 并忽略，但要记录 error 信息
                Toast.warning({
                    content: 'Loading recent added failed, try later',
                    duration: 3,
                });
                reject();
            }
        });
    };

    // NOTE: 这里 useEffect 第二个参数传空，当 componentDidMount 使用
    useEffect(() => {
        // NOTE: 加载组件时加载最近添加的书签，并设置 thread 数据源
        // 但不在这里加载数据到真正的 thread 中，而是在 InfiniteScroll 中通过 initialLoad 去调用加载 thread 的方法
        const loadInitialData = async () => {
            await promiseLoadRecentAdded();
        };

        loadInitialData();

        return () => {
            clearThread(true, true);
        };
    }, []);

    // NOTE: onChange 输入为空时，正常 setQuery 但不进行搜索，在按回车时清空降级处理
    const onChange = async (val: string, e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(val);

        logger.info(`on input change: ${val}`);

        const trimedQuery = val.trim();

        if (trimedQuery.length === 0) {
            return;
        }

        preSearch();
        await promiseSearch(trimedQuery);
        postSearch();
    };

    const clearThread = (clearRecent: boolean, clearSearch: boolean) => {
        if (clearRecent) {
            setRecent([]);
        }
        if (clearSearch) {
            setSearch([]);
        }
        setThread([]);
        setThreadCursor(0);
        setThreadSource([]);
        setThreadLoading(false);
        setThreadFetchCnt(0);
    };

    // NOTE 搜索前置步骤:
    // 1. 开启 loading
    // 2. 清空除了 recent 外的其他数据
    // 3. 更新 thread hint
    const preSearch = () => {
        logger.info('pre search start');
        setThreadContext(CTX_SEARCH);
        clearThread(false, true);
        setThreadHint(HINT_SEARCH_RESULTS);
        logger.info('pre search completed');
    };

    // NOTE 搜索后置步骤:
    // 1. 结束 loading
    const postSearch = () => {
        logger.info('post search start');
        // PLACEHOLDER
        logger.info('post search completed');
    };

    const promiseSearch = (query: string) => {
        return new Promise((resolve, reject) => {
            try {
                chrome.bookmarks.search(query.trim(), (res: chrome.bookmarks.BookmarkTreeNode[]) => {
                    const searchResults: Bookmark[] = [];
                    res.forEach((val, ...args) => {
                        // NOTE: 搜索结果过滤 folder
                        if (isFolder(val)) {
                            return;
                        }
                        searchResults.push({
                            id: val.id,
                            parentId: val.parentId ? val.parentId : '',
                            title: val.title,
                            url: val.url ? val.url : '',
                        });
                    });
                    setSearch(searchResults);
                    setThreadSource(searchResults);
                    logger.debug('promiseSearch results: ', searchResults);
                    resolve(searchResults);
                });
            } catch (error) {
                logger.error(error);
                Toast.error({
                    content: 'Error occurred during search',
                    duration: 3,
                });
                reject();
            }
        });
    };

    const onEnterPress = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        logger.info(`on input enter press: ${query}`);

        preSearch();

        // NOTE: 输入为空，并且按回车搜索时，清空输入并降级为展示最近添加
        if (query.trim() === '') {
            logger.warning('empty search content');
            Toast.warning({
                content: 'Empty input',
                duration: 3,
            });
            setQuery('');
            setThreadContext(CTX_RECENT_ADDED);
            setThreadHint(HINT_RECENT_ADDED);
            setThreadSource(recent);
            postSearch();
            return;
        }

        await promiseSearch(query);

        postSearch();
    };

    // NOTE: 从搜索结果中获取分页 thread 流
    const threadFetchData = () => {
        logger.info('fetch data count: ' + threadFetchCnt);
        setThreadLoading(true);
        if (threadCursor >= threadSource.length) {
            setThreadLoading(false);
            return;
        }
        const newThreadCursor = threadCursor + DEFAULT_PAGE_NUMBER;
        const nextDataSet = threadSource.slice(threadCursor, newThreadCursor);
        setThreadLoading(false);
        setThread(thread.concat(nextDataSet));
        setThreadCursor(newThreadCursor);
        setThreadFetchCnt(threadFetchCnt + 1);
        logger.info(`fetch data (${threadSource.length}): [${threadCursor}, ${newThreadCursor})`);
        logger.debug('next data set: ', nextDataSet);
    };

    const hasMoreItems = threadCursor < threadSource.length;
    // NOTE: Scroll 三次暂停一次
    const pauseScrolling = threadFetchCnt % 4 == 3;

    const threadLoadMoreButton =
        !threadLoading && hasMoreItems && pauseScrolling ? (
            <div
                style={{
                    textAlign: 'center',
                    marginTop: 12,
                    height: 32,
                    lineHeight: '32px',
                }}>
                <Button onClick={threadFetchData} style={{background: 'transparent'}}>
                    <IconChevronDownStroked size="extra-large" style={{color: 'black'}} />
                </Button>
            </div>
        ) : null;

    const deleteBookmark = async (localId: number, chromeId: string, refresh: boolean) => {
        logger.info(`deleteBookmark: ${localId} ${chromeId} started`);

        await new Promise((resolve, reject) => {
            try {
                logger.info('deleteBookmark promised');
                chrome.bookmarks.remove(chromeId, () => {
                    logger.info(`deleteBookmark (${chromeId}) from chrome successfully`);
                    thread.splice(localId, 1);
                    threadSource.splice(localId, 1);
                    logger.info(`deleteBookmark (${localId}) from local thread successfully`);
                    if (refresh) {
                        refreshThread();
                    }
                    resolve(thread);
                });
            } catch (error) {
                logger.error(error);
                Toast.error({
                    content: 'Error occurred during delete bookmark',
                    duration: 3,
                });
                reject();
            }
        });
    };

    const refreshThread = async () => {
        logger.info('refreshThread');
        // NOTE: CTX_RECENT_ADDED 时需要 reload 最近添加，因为一旦涉及删除操作，就可能需要更新 threadSource 补充数据
        // 但 CTX_SEARCH 时，同一个 query 结果都是固定的，因此即使有删除操作，也不需要刷新 threadSource
        if (threadContext === CTX_RECENT_ADDED) {
            await promiseLoadRecentAdded();
            logger.info('reload recent added done');
        }
        setThread([]);
        setThreadCursor(0);
        setThreadFetchCnt(0);
        setThreadRefresh(true);
        setThreadRefresh(false);
        logger.info('reload thread done');
    };

    const updateBookmark = async (localId: number, updatedBookmark: Bookmark) => {
        logger.info('updateBookmark: ', localId, updatedBookmark);

        await new Promise((resolve, reject) => {
            try {
                logger.info('updateBookmark promised');
                chrome.bookmarks.update(
                    updatedBookmark.id,
                    {title: updatedBookmark.title, url: updatedBookmark.url},
                    (res: chrome.bookmarks.BookmarkTreeNode) => {
                        logger.debug('updateBookmark updated: ', res);
                        thread.splice(localId, 1, updatedBookmark);
                        threadSource.splice(localId, 1, updatedBookmark);
                        resolve(res);
                    },
                );
            } catch (error) {
                logger.error(error);
                Toast.error({
                    content: 'Error occurred during update bookmark',
                    duration: 3,
                });
                refreshThread();
                reject();
            }
        });
    };

    const threadRenderItem = (item: Bookmark, ind: number) => {
        logger.info('title: ' + item.title + ' idx: ' + ind);
        return <ThreadItem item={item} localId={ind} deleteCallback={deleteBookmark} updateCallback={updateBookmark} />;
    };

    return (
        <div className="search flex flex-col">
            <div className="search-input">
                <Input
                    size="large"
                    prefix={<IconSearch />}
                    showClear
                    value={query}
                    onChange={onChange}
                    onEnterPress={onEnterPress}></Input>
            </div>
            <Divider margin="12px" align="center">
                {threadHint}
            </Divider>
            <div
                // NOTE: InfiniteScroll container height = h-16 * DEFAULT_PAGE_NUMBER
                className="h-80 overflow-x-clip overflow-y-auto">
                {!threadRefresh && (
                    <InfiniteScroll
                        initialLoad={true}
                        pageStart={0}
                        threshold={20}
                        loadMore={threadFetchData}
                        hasMore={!threadLoading && hasMoreItems && !pauseScrolling}
                        useWindow={false}>
                        <List
                            loadMore={threadLoadMoreButton}
                            dataSource={thread}
                            renderItem={threadRenderItem}
                            emptyContent="No Data Available..."
                        />
                        {threadLoading && hasMoreItems && (
                            <div className="text-center">
                                <Spin />
                            </div>
                        )}
                    </InfiniteScroll>
                )}
            </div>
        </div>
    );
};

export default Search;
