import React, { Fragment } from 'react';

import { Link as LinkIcon } from '@material-ui/icons';

import Space from '../space';

export default ({ website }) => (
    <Fragment>
        {website && (
            <Fragment>
                <LinkIcon color="primary"/>
                <a href={website} target="_blank" rel="noopener noreferrer">
                    {' '}{website}
                </a>
                <Space space="10px"/>
            </Fragment>
        )}
    </Fragment>
)
