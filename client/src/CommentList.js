import React from 'react';

export default({ comments }) => {

    const renderedComments = comments.map(comment => {
        let content;

        if (comment.status === 'approved') {
            content = comment.content;
        }

        if (comment.status === 'pending') {
            content = 'Comment waiting for Moderation';
        }

        if (comment.status === 'rejected') {
            content = 'Comment rejected';
        }
        
        return <li key={comment.id}>{content}</li>
    });

    return <ul>{renderedComments}</ul>;
};