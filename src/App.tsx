import React from 'react';
import ReactDOM from 'react-dom';
import {Divider, Input, Typography} from '@douyinfe/semi-ui';
import {IconSearch} from '@douyinfe/semi-icons';
import './App.css';

const {Title} = Typography;

const App = () => {
    return (
        <div className="App max-h-48">
            <Title>Search Bookmarks</Title>
            <Divider margin="12px" />
            <Input size="large" suffix={<IconSearch />} showClear></Input>
        </div>
    );
};

export default App;
