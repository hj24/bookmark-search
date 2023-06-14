import React from 'react';
import ReactDOM from 'react-dom';
import {Divider, Icon, Typography, LocaleProvider} from '@douyinfe/semi-ui';
import en_GB from '@douyinfe/semi-ui/lib/es/locale/source/en_GB';
import {IconGithubLogo} from '@douyinfe/semi-icons';
import Search from './pages/popup/search';
import './App.css';
import SvgBulleye from './components/icons/Bulleye';

const {Title} = Typography;

const App = () => {
    return (
        <LocaleProvider locale={en_GB}>
            <div className="App">
                <div className="flex flex-1 flex-row justify-center items-center">
                    <div className="flex items-baseline">
                        <Icon svg={<SvgBulleye width={32} height={32} />} />
                    </div>
                    <div>
                        <Title style={{margin: '2% 0 4% 0'}}>Search Bookmarks</Title>
                    </div>
                </div>
                <Divider margin="12px" align="center">
                    <IconGithubLogo
                        size="default"
                        onClick={() => {
                            window.open('https://github.com/hj24/bookmark-search', '_blank');
                        }}
                    />
                </Divider>
                <Search />
            </div>
        </LocaleProvider>
    );
};

export default App;
