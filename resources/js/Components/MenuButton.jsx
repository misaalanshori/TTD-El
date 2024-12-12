import React, { useState } from 'react';
import { Menu } from '@mui/material';

function MenuButton({ children, button, anchorOrigin, ...divProps }) {
    const [anchorEl, setAnchorEl] = useState(null);

    const handleOpenMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
    };

    const clonedButton = React.cloneElement(button, {
        onClick: handleOpenMenu,
    });

    return (
        <div {...divProps}>
            {clonedButton}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
                anchorOrigin={anchorOrigin || { vertical: 'bottom', horizontal: 'left' }}
            >
                {React.Children.map(children, (child) =>
                    React.cloneElement(child, {
                        onClick: (event) => {
                            // Call the original onClick if it exists
                            if (child.props.onClick) {
                                child.props.onClick(event);
                            }
                            // Close the menu
                            handleCloseMenu();
                        }
                    })
                )}
            </Menu>
        </div>
    );
}

export default MenuButton;
