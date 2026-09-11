import React from 'react';
import {IconGiftStroked, IconGithubLogo} from '@douyinfe/semi-icons';
import './links.css';

const GITHUB_URL = 'https://github.com/hj24/bookmark-search';
const SUPPORT_URL =
    'https://pancake.waffo.ai/store/save1s-life-iysu9loo/product/PROD_6CxNI24ZzXY3L6wNPl1OXx?type=onetime&currency=USD';

const HeaderLinks = () => (
    <nav className="header-links" aria-label="Project links">
        <a
            className="header-links-github"
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub repository (opens in a new tab)">
            <IconGithubLogo size="default" aria-hidden="true" />
        </a>
        <span className="header-links-divider" aria-hidden="true" />
        <a
            className="header-links-support"
            href={SUPPORT_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Sponsor project (opens in a new tab)">
            <IconGiftStroked style={{fontSize: 18}} aria-hidden="true" />
            <span>Sponsor project</span>
        </a>
    </nav>
);

export default HeaderLinks;
