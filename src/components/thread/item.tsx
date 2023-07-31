import React, {useEffect, useRef, useState} from 'react';
import {assign, createMachine} from 'xstate';
import {useMachine} from '@xstate/react';
import {Button, ButtonGroup, Icon, Input, List, Modal, Toast, Tooltip} from '@douyinfe/semi-ui';
import {IconDeleteStroked, IconEditStroked, IconUndo, IconTick} from '@douyinfe/semi-icons';
import {Logger} from '../../utils/log';
import './item.css';
import SvgBookmark from '../icons/Bookmark';

const logger = new Logger('bs.components.thread.item');

export type Bookmark = {
    id: string;
    parentId: string;
    title: string;
    url: string;
};

type ItemModifyEvent = {
    title: string;
    titleModified: boolean;
    url: string;
    urlModified: boolean;
};

interface Props {
    item: Bookmark;
    localId: number;
    deleteCallback: (localId: number, chromeId: string, refresh: boolean) => void;
    updateCallback: (localId: number, updatedBookmark: Bookmark) => void;
}

export const ThreadItem: React.FC<Props> = (props: Props) => {
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [contextMenuVisible, setContextMenuVisible] = useState(false);
    const postTitleRef = useRef<HTMLInputElement>(null);
    const postURLRef = useRef<HTMLInputElement>(null);
    const contextMenuRef = useRef<HTMLDivElement>(null);
    const itemContentRef = useRef<HTMLDivElement>(null);

    const threadItemMachine = createMachine(
        {
            id: 'thread_item',
            initial: 'normal',
            context: {
                preImage: {title: props.item.title, url: props.item.url},
                postImage: {title: props.item.title, url: props.item.url},
                modified: false,
            },
            states: {
                normal: {
                    on: {
                        DELETE: {target: 'deleted'},
                        EDIT: {
                            target: 'editing',
                            actions: ['edit'],
                        },
                        EDITDONE: {target: 'normal'},
                        EDITUNDO: {target: 'normal'},
                    },
                },
                deleted: {
                    on: {
                        DELETE: {target: 'deleted'},
                        DELETEUNDO: {target: 'normal'},
                    },
                    entry: ['delete'],
                },
                editing: {
                    on: {
                        EDIT: {
                            target: 'editing',
                            actions: ['edit'],
                        },
                        EDITDOING: {
                            target: 'editing',
                            actions: ['doing'],
                        },
                        EDITDONE: {
                            target: 'normal',
                            actions: ['done'],
                        },
                        EDITUNDO: {
                            target: 'normal',
                            actions: ['undo'],
                        },
                    },
                },
            },
        },
        {
            actions: {
                edit: (ctx, event) => {
                    logger.info('on edit action: ', ctx, event);
                    setEditModalVisible(true);
                },
                undo: assign((ctx, event) => {
                    logger.info('on undo action: ', ctx, event);
                    props.item.title = ctx.preImage.title;
                    props.item.url = ctx.preImage.url;
                    return {
                        postImage: {
                            title: ctx.preImage.title,
                            url: ctx.preImage.url,
                        },
                        modified: false,
                    };
                }),
                delete: (ctx, event) => {
                    logger.info('on delete action: ', ctx, event);
                    setDeleteModalVisible(true);
                },
                doing: assign((ctx, event) => {
                    logger.info('on doing action: ', ctx, event);
                    const modifyEvent = event.modifyEvent as ItemModifyEvent;
                    let modified = false;
                    let postTitle = ctx.postImage.title;
                    if (modifyEvent.titleModified && modifyEvent.title !== postTitle) {
                        postTitle = modifyEvent.title;
                        modified = true;
                    }
                    let postURL = ctx.postImage.url;
                    if (modifyEvent.urlModified && modifyEvent.url !== postURL) {
                        postURL = modifyEvent.url;
                        modified = true;
                    }
                    logger.debug('after doing: ', postTitle, postURL, modified);
                    return {
                        postImage: {
                            title: postTitle,
                            url: postURL,
                        },
                        modified: modified,
                    };
                }),
                // NOTE: 编辑成功的终点，更新 chrome 成功后把 modified 置为 false，pre 设置为 post
                done: assign((ctx, event) => {
                    logger.info('on done action: ', ctx, event);
                    if (!ctx.modified) {
                        return {
                            preImage: {
                                title: ctx.postImage.title,
                                url: ctx.postImage.url,
                            },
                            modified: false,
                        };
                    }
                    const postBookmark: Bookmark = {
                        id: props.item.id,
                        parentId: props.item.parentId,
                        title: ctx.postImage.title,
                        url: ctx.postImage.url,
                    };
                    props.updateCallback(props.localId, postBookmark);
                    return {
                        preImage: {
                            title: ctx.postImage.title,
                            url: ctx.postImage.url,
                        },
                        modified: false,
                    };
                }),
            },
        },
    );

    const [state, send] = useMachine(threadItemMachine);

    useEffect(() => {
        if (itemContentRef.current) {
            // 添加 contextmenu 的监听
            itemContentRef.current.addEventListener('contextmenu', showContextMenu);
            document.addEventListener('click', hideContextMenu);
        }

        return () => {
            if (itemContentRef.current) {
                itemContentRef.current.removeEventListener('contextmenu', showContextMenu);
                document.removeEventListener('click', hideContextMenu);
            }
        };
    }, [contextMenuVisible]);

    const showContextMenu = (e: any) => {
        logger.info('showContextMenu 1: ', contextMenuRef, itemContentRef, e);
        e.preventDefault();

        setContextMenuVisible(true);

        logger.info('showContextMenu 2: ', contextMenuRef);
        if (!contextMenuRef.current) {
            return;
        }

        // 获取当前鼠标位置
        const clickX = e.clientX;
        const clickY = e.clientY;

        // 修改菜单的位置到当前鼠标位置
        contextMenuRef.current.style.left = `${clickX}px`;
        contextMenuRef.current.style.top = `${clickY}px`;
        logger.info('showContextMenu 3: ', contextMenuVisible);
    };

    const hideContextMenu = () => {
        logger.info('hideContextMenu: ', contextMenuVisible, props.item.title);
        if (!contextMenuVisible) {
            return;
        }
        setContextMenuVisible(false);
    };

    const onEditItemOk = () => {
        logger.info('onEditItemOk: ', postTitleRef, postURLRef);
        if (postTitleRef.current?.value.length === 0 || postURLRef.current?.value.length === 0) {
            Toast.error({
                content: 'Empty content!',
                duration: 3,
            });
            return;
        }
        if (postTitleRef.current?.value) {
            props.item.title = postTitleRef.current?.value;
        }
        if (postURLRef.current?.value) {
            props.item.url = postURLRef.current?.value;
        }
        setEditModalVisible(false);
    };

    const onEditItemCancel = () => {
        logger.info('onEditItemCancel');
        send('EDITUNDO');
        setEditModalVisible(false);
    };

    const onTitleModified = (newTitle: string, e: React.ChangeEvent<HTMLInputElement>) => {
        logger.info('onTitleModified: ', newTitle);
        send({
            type: 'EDITDOING',
            modifyEvent: {
                title: newTitle,
                titleModified: true,
            },
        });
    };

    const onURLModified = (newURL: string, e: React.ChangeEvent<HTMLInputElement>) => {
        logger.info('onURLModified: ', newURL);
        send({
            type: 'EDITDOING',
            modifyEvent: {
                url: newURL,
                urlModified: true,
            },
        });
    };

    const onDeleteItemOk = () => {
        logger.info('onDeleteItemOk: ', props.localId, props.item.id);
        props.deleteCallback(props.localId, props.item.id, true);
        setDeleteModalVisible(false);
    };

    const onDeleteItemCancel = () => {
        logger.info('onDeleteItemCancel');
        send('DELETEUNDO');
        setDeleteModalVisible(false);
    };

    const onEdit = () => {
        send('EDIT');
    };

    const onEditUndo = () => {
        send('EDITUNDO');
    };

    const onDelete = () => {
        send('DELETE');
    };

    const onEditDone = () => {
        logger.debug('onEditDone confirmed edit, pre status: ', state);
        send('EDITDONE');
    };

    return (
        <div className="thread-items-container" ref={itemContentRef}>
            <List.Item
                className="semi-list-item"
                header={
                    <div className="semi-list-item-body-header">
                        {/* //<IconBookmark size="large" /> */}
                        <Icon svg={<SvgBookmark width={20} height={20} />} />
                    </div>
                }
                main={
                    <div
                        // ref={itemContentRef}
                        className="semi-list-item-body-main"
                        onClick={() => {
                            window.open(props.item.url, '_blank');
                        }}>
                        <Tooltip content={props.item.title} arrowPointAtCenter={false} position="topLeft">
                            <p className="truncate" style={{color: 'var(--semi-color-text-0)', fontWeight: 400}}>
                                {props.item.title}
                            </p>
                        </Tooltip>
                        <Tooltip content={props.item.url} arrowPointAtCenter={false} position="topLeft">
                            <p className="truncate" style={{color: 'var(--semi-color-text-2)', margin: '4px 0'}}>
                                {props.item.url}
                            </p>
                        </Tooltip>
                    </div>
                }
                extra={
                    <div className="semi-list-item-extra">
                        {state.value === 'editing' ? (
                            <ButtonGroup theme="borderless" className="semi-button-group">
                                <Button onClick={onEditDone}>
                                    <IconTick className="text-black" size="default" />
                                </Button>
                                <Button onClick={onEditUndo}>
                                    <IconUndo className="text-black" size="default" />
                                </Button>
                            </ButtonGroup>
                        ) : (
                            <ButtonGroup theme="borderless" className="semi-button-group">
                                <Button onClick={onEdit}>
                                    <IconEditStroked className="text-black" size="default" />
                                </Button>
                                <Button onClick={onDelete}>
                                    <IconDeleteStroked className="text-black" size="default" />
                                </Button>
                            </ButtonGroup>
                        )}
                    </div>
                }
            />
            <Modal
                className="thread-item-edit-modal"
                title="Edit"
                visible={editModalVisible}
                onOk={onEditItemOk}
                onCancel={onEditItemCancel}
                closable={false}
                closeOnEsc={false}>
                <Input prefix="Title" onChange={onTitleModified} defaultValue={props.item.title} ref={postTitleRef} />
                <Input prefix="URL" onChange={onURLModified} defaultValue={props.item.url} ref={postURLRef} />
            </Modal>
            <Modal
                className="thread-item-delete-modal"
                title="Delete"
                visible={deleteModalVisible}
                okType="danger"
                onOk={onDeleteItemOk}
                onCancel={onDeleteItemCancel}
                closable={false}
                closeOnEsc={false}>
                <p>Delete action cannot be reverted!</p>
            </Modal>
            {contextMenuVisible ? (
                <div className="thread-item-context-menu" ref={contextMenuRef}>
                    <div className="thread-item-context-menu-item">Copy Title</div>
                    <div className="thread-item-context-menu-item">Copy URL</div>
                </div>
            ) : null}
        </div>
    );
};
