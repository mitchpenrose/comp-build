import styled from "styled-components"
import { useLocation, useNavigate } from "react-router-dom";

const TabsContainer = styled.div`
  display: flex;
  height: 30px;
  min-width: 790px;
`

const TabItem = styled.div<{ selected: boolean }>`
  margin: auto;
  cursor: pointer;
  text-decoration: ${props => props.selected === true ? 'underline' : 'null'};
  font-size: large;
  user-select: none;
`

const Tabs = () => {
    const navigate = useNavigate()
    const location = useLocation()

    const onTabClick = (path: string) => {
        navigate(path)
    }

    return <TabsContainer>
    <TabItem selected={location.pathname === '/'} onClick={() => onTabClick('/')}>Composition Builder</TabItem>
    <TabItem style={{marginRight: '250px'}} selected={location.pathname === '/winrates'} onClick={() => onTabClick('/winrates')}>Win Rates</TabItem>
  </TabsContainer>
}

export default Tabs