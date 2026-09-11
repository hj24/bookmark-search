import React from 'react';
import {Icon, Typography, LocaleProvider} from '@douyinfe/semi-ui';
import en_GB from '@douyinfe/semi-ui/lib/es/locale/source/en_GB';
import Search from './pages/popup/search';
import './App.css';
import SvgBulleye from './components/icons/Bulleye';
import HeaderLinks from './components/header/links';

const {Title} = Typography;

const App = () => {
    return (
        <LocaleProvider locale={en_GB}>
            <div className="App">
                <div className="App-header">
                    <div className="App-header-main">
                        <Icon svg={<SvgBulleye width={32} height={32} />} />
                        <Title style={{margin: '2% 0 2% 0'}}>
                            {/* NOTE: need to set text-white to override semi default text color */}
                            <div className="text-white">Search Bookmarks</div>
                        </Title>
                    </div>
                    <HeaderLinks />
                </div>
                <div className="App-body">
                    <Search />
                </div>
            </div>
        </LocaleProvider>
    );
};

export default App;
