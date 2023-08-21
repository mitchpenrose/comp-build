import React, { ReactElement, ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import styled, { createGlobalStyle } from 'styled-components'
import { getChampion, getWinrates } from './Services/services'
import Context, { ChampionSelection, Data } from './Context/Context'
import { ReactComponent as Logo } from './icons/logo.svg'
import Modal from './Components/Modal'
import GA4 from 'react-ga4'
import CompBuilder from './Components/CompBuilder'
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import WinRates from './Components/WinRates'
import Tabs from './Components/Tabs'

// Modal.setAppElement('#root')
const GlobalStyle = createGlobalStyle`
    body {
      margin: 0;
      padding: 0;
      background: #1e2024;
      color: #808080;
    }
`

const Header = styled.div`
  background-color: #191b1e;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  min-width: 1600px;//1718
`

const Footer = styled.div`
  background-color: #191b1e;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 1600px;
  height: 100px;
`

const PatchInfo = styled.div`
  position: absolute;
  right: 50px;
`

const SubButton = styled.div`
  margin: 20px;
  margin-left: 50px;
  margin-right: 50px;
  cursor: pointer;
  user-select: none;
`

function App() {

  // const navigate = useNavigate()

  const [championSelections, setChampionSelections] = useState<{ value: string, label: string }[]>([])
  const [championToImage, setChampionToImage] = useState(new Map<string, any>())
  const [pickedChamps, setPickedChamps] = useState<string[]>([])
  const [championWinRates, setChampionWinRates] = useState<any>({})
  // const [width, setWidth] = useState('100%')
  // const rootRef = useRef(null)
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false)
  const [infoModalTitle, setInfoModalTitle] = useState<string>('')
  const [infoModalContent, setInfoModalContent] = useState<any>(<></>)
  const [loading, setLoading] = useState<Promise<void>[]>([new Promise(() => { }), new Promise(() => { }), new Promise(() => { })])
  const [currentlyLoading, setCurrentlyLoading] = useState(true)

  const patch = '13.14.1'

  useEffect(() => {
    GA4.initialize("G-BPQ188CVYS")
    GA4.send({ hitType: "pageview" })
  }, [])

  useEffect(() => {
    getWinrates().then((result) => {
      setChampionWinRates(result)
      loading[0] = Promise.resolve()
      setLoading([...loading])
    })
    getChampion(patch).then((result) => {
      const data = result.data as Record<string, { id: string, name: string }>
      setChampionSelections(Object.entries(data).map(([, value]) => { return { value: value.id, label: value.name } }))
      loading[1] = Promise.resolve()
      setLoading([...loading])
    })
  }, [])

  useEffect(() => {
    const championToImage = new Map<string, any>()
    championSelections.forEach((champ) => {
      const img = new Image()
      //img.src = require(`./Images/${champ.value}.png`)//`http://ddragon.leagueoflegends.com/cdn/${patch}/img/champion/${champ.value}.png`
      img.src = `https://ddragon.leagueoflegends.com/cdn/${patch}/img/champion/${champ.value}.png`
      championToImage.set(champ.value, img)
    })
    setChampionToImage(championToImage)
    loading[2] = Promise.resolve()
    setLoading([...loading])
  }, [championSelections.length])

  useMemo(async () => {
    if (await Promise.all(loading)) {
      setCurrentlyLoading(false)
    }
  }, [loading])

  const setupInfoModal = (title: string) => {
    if (title === 'About') {
      setInfoModalContent(<div>
      <h2>Composition Builder</h2>
      <p>
        Composition Builder is a dynamic tool created for League of Legends players to optimize team compositions, offering informed champion selections rooted in data from Platinum+ tier matches. It allows users to evaluate individual champions in different roles, comparing them against all other champions within their team or against opponents.
      </p>
      <p>
        On the right or left side of the champion selection interface, users can find two tables: the Synergy table and the Matchup table. The Synergy table presents win rate data for the chosen champion in relation to their team members, with each row representing a different role: top, jungle, mid, ADC, and support. The 'Average Synergy' reflects the mean win rate based on all these combinations.
      </p>
      <p>
        Conversely, the Matchup table analyzes how the selected champion fares against each opponent in their corresponding role, and the 'Average Matchup' offers a comprehensive view of the performance across all opponents.
      </p>
      <p>
        Both these averages are then combined to form a 'Combined Results' value, providing an overview of the team's composition performance. However, it's important to remember that these statistics are not definitive indicators of match outcomes, but rather insightful references to comprehend historical champion synergy and matchups.
      </p>
      <p>
        For users who are unsure of champion role efficiency, the '?' button is a tool that displays champions with historically high synergy and matchup win rates. These are ordered from highest to lowest, offering a ranking system for decision making.
      </p>
      <p>
        Finally, users can clear a selected champion by clicking the button left or right of the champion dropdown. This allows for quick adjustments and recalculations, ensuring users can experiment with various team compositions with ease.
      </p>
      <p>
        Composition Builder aims to enhance strategizing and planning, encouraging data-driven decisions to elevate gameplay.
      </p>

      <h2>Win Rates</h2>
      <p>
        Win Rates offers a detailed breakdown of champion win rates for each role (top, jungle, mid, ADC, support) as well as an aggregated view of all roles. Users can tailor their view by sorting the data based on win rate or play rate, filtering by specific champion names, and specifying a minimum number of games for the results.
      </p>
      <p>
        By clicking on a particular champion, a pop-up window will appear displaying how the selected champion performs against opponents in the chosen role. Within this window, users have the flexibility to modify the data parameters:
      </p>
      <ul>
        <li>Champion: You can switch to another champion within the pop-up window.</li>
        <li>Position: You can change the role for the selected champion, selecting from all roles, top, jungle, mid, ADC, or support.</li>
        <li>Matchup Type: Choose whether you want to see how your selected champion synergizes with teammates (paired with) or competes against opponents (versus).</li>
        <li>Opponent/Teammate Position: Choose the role of the champions your selected champion is being compared against.</li>
      </ul>
      <p>
        The title of the pop-up window updates accordingly, displaying the format 'Champion in Position Versus/Paired with Champions in Position'. Clicking on a champion within the window will update the selected champion.
      </p>
      <p>
        Additional customization options in the pop-up window include sorting by win rate or play rate, searching for specific champions, and setting a minimum number of games for the displayed results.
      </p>
    </div>)
    }
    if (title === 'Legal') {
      setInfoModalContent(`Compbuilder.gg isn't endorsed by Riot Games and doesn't reflect the views 
      or opinions of Riot Games or anyone officially involved in producing or managing 
      Riot Games properties. Riot Games, and all associated properties are trademarks 
      or registered trademarks of Riot Games, Inc.`)
    }
    else if (title === 'Contact') {
      setInfoModalContent(
        <div>We'd love to hear from you! If you have any questions, suggestions, or business
          opportunities to discuss, feel free to reach out at <a href="mailto:compbuildergg@gmail.com">compbuildergg@gmail.com</a>. Our team is always here to help.</div>)
    }
    else if (title === 'Privacy Policy') {
      setInfoModalContent(<div>
        <p>Last updated: 8/2/2023</p>
        <h2>1. Introduction</h2>
        <p>Compbuilder.gg values your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our dynamic tool for League of Legends players. Please read this Privacy Policy carefully. If you do not agree with the terms of this Privacy Policy, please do not access the site.</p>
        <h2>2. Information We Collect</h2>
        <p>We may collect information about you in various ways, including:</p>
        <ul>
          <li>Automatically Collected Data: We collect data automatically when you visit our website, such as your IP address, browser type, operating system, page views, scrolls, user engagement, and other statistics. We utilize Google Analytics to track this information.</li>
          <li>Location Information: We collect information about your country of origin and more localized data for a 30-minute real-time overview.</li>
        </ul>
        <h2>3. How We Use Your Information</h2>
        <p>We may use the information we collect about you to:</p>
        <ul>
          <li>Enhance your user experience.</li>
          <li>Understand and analyze the usage trends and preferences of our users.</li>
          <li>Improve the functionality and features of Compbuilder.gg.</li>
          <li>Monitor and analyze the effectiveness of Compbuilder.gg and our marketing activities.</li>
          <li>Detect, prevent, or investigate security breaches or fraud.</li>
        </ul>
        <h2>4. How We Share Your Information</h2>
        <p>We may share your information with third-party vendors, service providers, contractors, or agents who perform services for us or on our behalf, including Google Analytics.</p>
        <h2>5. Cookies and Tracking Technologies</h2>
        <p>We may use cookies, web beacons, and other tracking technologies to collect and store your information. We utilize Google Analytics to help us understand how our website is being used.</p>
        <p>If you wish to opt out of Google Analytics tracking, you may download and install the <a href="https://tools.google.com/dlpage/gaoptout">Google Analytics Opt-out Browser Add-on</a>. The add-on is designed to be compatible with Chrome, Safari, Firefox, and Microsoft Edge and allows website visitors the ability to prevent their data from being used by Google Analytics. More information about the opt-out and how to properly install the browser add-on can be found at the aforementioned link.</p>
        <h2>6. Security</h2>
        <p>We take your security seriously. Compbuilder.gg uses HTTPS and TLS encryption to ensure that the minimal information we collect is transmitted securely. We also employ reasonable administrative, technical, and physical security measures to protect your personal information. We strive to protect your information to the fullest extent possible.</p>
        <h2>7. Google AdSense</h2>
        <p>If we employ Google AdSense, we adhere to Google's policies, and we disclose the use of cookies and/or web beacons to collect data in the ad serving process.</p>
        <h2>8. Your Rights</h2>
        <p>Depending on your jurisdiction, you may have certain rights regarding your personal information, such as the right to access, rectification, erasure, restriction of processing, data portability, object to processing, or lodge a complaint with a supervisory authority.</p>
        <p>We encourage you to familiarize yourself with these rights, which may vary depending on local regulations. You can typically find information about your rights from governmental or regulatory bodies responsible for data protection in your jurisdiction or from local consumer protection agencies.</p>
        <h2>9. Changes to This Privacy Policy</h2>
        <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.</p>
        <h2>10. Contact Us</h2>
        <p>If you have any questions or comments about this Privacy Policy, please contact us at:</p>
        <a href="mailto:compbuildergg@gmail.com">compbuildergg@gmail.com</a>
      </div>)
    }
    setInfoModalTitle(title)
    setShowInfoModal(true)
  }

  const formattedPatch = () => {
    const split = patch.split(".")
    if (split[split.length - 1] === '1') {
      return `${split[0]}.${split[1]}`
    }
    return patch
  }

  return (
    currentlyLoading === false ? <Context.Provider value={{ champData: championSelections, patch: patch, selectedChampions: pickedChamps, championToImage: championToImage, loading: currentlyLoading } as Data}>
      <div id='main'>
        <GlobalStyle />
        <Modal isOpen={showInfoModal} onClose={() => { setShowInfoModal(false) }} title={infoModalTitle} height={(infoModalTitle === 'About' || infoModalTitle === 'Privacy Policy') ? undefined : 'fit-content'}>
          <div>
            {infoModalContent}
          </div>
        </Modal>

        <BrowserRouter>
          <Header id='header'>
            <Logo />
            <Tabs />
            <PatchInfo>
              Patch {formattedPatch()}
            </PatchInfo>
          </Header>
          <Routes>
            <Route path='/' element={<CompBuilder championWinRates={championWinRates} pickedChamps={pickedChamps} setPickedChamps={setPickedChamps} />} />
            <Route path='/winrates' element={<WinRates championWinRates={championWinRates} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Footer>
            <SubButton onClick={() => setupInfoModal('About')}>About</SubButton>
            <SubButton onClick={() => setupInfoModal('Contact')}>Contact</SubButton>
            <SubButton onClick={() => setupInfoModal('Legal')}>Legal</SubButton>
            <SubButton onClick={() => setupInfoModal('Privacy Policy')}>Privacy Policy</SubButton>
            {/* <SubButton>Donate</SubButton> */}
          </Footer>
        </BrowserRouter>

      </div>
    </Context.Provider>
      : <div />
  );
}

export default App;
