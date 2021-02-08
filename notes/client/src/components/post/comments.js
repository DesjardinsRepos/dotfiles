import React, { Fragment } from 'react';

import { withStyles } from '@material-ui/core/styles';
import { Grid } from '@material-ui/core';

import styles from '../../styles/comments';
import UserImage from '../base/userImage';
import Space from '../base/space';
import Date from '../base/date';
import UserHandle from '../base/userHandle';
import PostBody from '../base/postBody';

export default withStyles(styles)( ({ comments, classes }) => 

    <Grid container>
        {comments.map(comment => {
            
            const { body, createdAt, userImage, userHandle } = comment;

            return (
                <Fragment key={createdAt}>

                    <hr className={classes.visibleSeperator}/>

                    <Grid item sm={12} style={{ marginBottom: '10px'}}>
                        <Grid container className={classes.grid}>

                            <Grid item sm={2}>
                                <UserImage image={userImage} size="80px"/>
                            </Grid>

                            <Grid item sm={10}>
                                <div className={classes.commentBody}>

                                    <UserHandle userHandle={userHandle}/>
                                    <Date date={createdAt}/>
                                        <Space small/>
                                    <PostBody body={body}/>
                                </div>
                            </Grid>
                        </Grid>
                    </Grid>
                </Fragment>
            )
        })}
    </Grid>
)