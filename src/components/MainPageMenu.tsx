import React, { memo, Fragment } from 'react';
import Divider from "@material-ui/core/Divider";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import { NavLink } from "react-router-dom";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Tooltip from '@material-ui/core/Tooltip';
import { makeStyles } from '@material-ui/core/styles';
import { OverridableComponent } from '@material-ui/core/OverridableComponent';
import { SvgIconTypeMap } from '@material-ui/core/SvgIcon';


const useStyles = makeStyles((theme) => {
    return ({
        activeLink: {
            backgroundColor: theme.palette.action.selected,
        },
    })
})

export interface SectionObj {
  localKey: string,
  route: string,
  icon: OverridableComponent<SvgIconTypeMap<{}, "svg">>,
  homeSection?: boolean,
}

export interface MenuItemsDict {
  [key: string]: SectionObj[];
}


interface MainPageMenuProps {
  mainMenuDict: MenuItemsDict;
  sectionsToRender: string[];
}

export const MainPageMenu: React.FC<MainPageMenuProps> = (
  {
    mainMenuDict,
    sectionsToRender,
  }) => {
  const classes = useStyles();
  console.log(sectionsToRender)
  return (
    <>
      {
        sectionsToRender.map(sectionKey => (
          <Fragment key={sectionKey}>
            <Divider />
            <List>
              {
                mainMenuDict[sectionKey as keyof MenuItemsDict].map(({ localKey, route, icon: Icon }) => {
                  return (
                    <Tooltip key={localKey} title={localKey}>
                      <ListItem
                        button
                        component={NavLink}
                        to={route}
                        activeClassName={classes.activeLink}
                      >
                        <ListItemIcon><Icon color="primary"/></ListItemIcon>
                        <ListItemText primary={localKey} />
                      </ListItem>
                    </Tooltip>
                  )
                })
              }
            </List>
          </Fragment>
        ))
      }
    </>
  )
}

export default memo(MainPageMenu);