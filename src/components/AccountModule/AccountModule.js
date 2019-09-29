import React, { useRef } from 'react'
import PropTypes from 'prop-types'
import {
  Button,
  EthIdenticon,
  Popover,
  GU,
  IconDown,
  IconConnect,
  RADIUS,
  textStyle,
  useTheme,
  IdentityBadge,
  unselectable,
} from '@aragon/ui'
import { shortenAddress } from '../../web3-utils'
import { useAccount } from '../../account'

function getNetworkName(networkId) {
  if (networkId === 'main') return 'Mainnet'
  if (networkId === 'rinkeby') return 'Rinkeby'
  return networkId
}

function AccountModule({ compact, locator }) {
  const { connected } = useAccount()
  return connected ? (
    <ConnectedMode locator={locator} />
  ) : (
    <NonConnectedMode compact={compact} />
  )
}

AccountModule.propTypes = {
  compact: PropTypes.bool.isRequired,
  locator: PropTypes.object.isRequired,
}

function NonConnectedMode({ compact }) {
  const { enable } = useAccount()
  return (
    <div
      css={`
        display: flex;
        align-items: center;
        text-align: left;
        padding: 0 ${(compact ? 1 : 2) * GU}px;
      `}
    >
      <Button
        size={compact ? 'small' : 'medium'}
        icon={<IconConnect />}
        label="Enable account"
        onClick={enable}
        wide
      />
    </div>
  )
}

function ConnectedMode({ locator }) {
  const { address, label, networkId } = useAccount()
  const theme = useTheme()
  // const [opened, setOpened] = useState(false)

  // const open = useCallback(() => {
  //   setOpened(true)
  // }, [])

  // const close = useCallback(() => {
  //   setOpened(false)
  // }, [])

  const containerRef = useRef()

  const networkName = getNetworkName(networkId)

  return (
    <a
      ref={containerRef}
      css={`
        display: flex;
        height: 100%;
        ${unselectable};
        text-decoration: none;
        color: inherit
        cursor: pointer;
        &:hover {
          background: ${theme.surfacePressed};
        }
      `}
      href={`${window.location.origin}#/${locator.dao.substr(
        0,
        locator.dao.indexOf('.')
      )}/profile/${address}`}
    >
      {/* <ButtonBase
        onClick={open}
        css={`
          display: flex;
          align-items: center;
          text-align: left;
          padding: 0 ${1 * GU}px 0 ${2 * GU}px;

          &:active {
            background: ${theme.surfacePressed};
          }
        `}
      > */}
      <div
        css={`
          display: flex;
          align-items: center;
          text-align: left;
          padding: 0 ${1 * GU}px 0 ${2 * GU}px;
        `}
      >
        <div
          css={`
            position: relative;
          `}
        >
          <EthIdenticon address={address} radius={RADIUS} />
          <div
            css={`
              position: absolute;
              bottom: -3px;
              right: -3px;
              width: 10px;
              height: 10px;
              background: ${theme.positive};
              border: 2px solid ${theme.surface};
              border-radius: 50%;
            `}
          />
        </div>
        <div
          css={`
            padding-left: ${1 * GU}px;
            padding-right: ${0.5 * GU}px;
          `}
        >
          <div
            css={`
              margin-bottom: -5px;
              ${textStyle('body2')}
            `}
          >
            {label ? (
              <div
                css={`
                  overflow: hidden;
                  max-width: ${16 * GU}px;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                `}
              >
                {label}
              </div>
            ) : (
              <div>{shortenAddress(address)}</div>
            )}
          </div>
          <div
            css={`
              font-size: 11px; /* doesn’t exist in aragonUI */
              color: ${theme.surfaceContentSecondary};
            `}
          >
            Connected {networkName ? `to ${networkName}` : ''}
          </div>
        </div>
        {null && (
          <IconDown
            size="small"
            css={`
              color: ${theme.surfaceIcon};
            `}
          />
        )}
        {/* </ButtonBase> */}
      </div>
      <Popover
        closeOnOpenerFocus
        placement="bottom-end"
        onClose={close}
        visible={false}
        opener={containerRef.current}
      >
        <section>
          <h1
            css={`
              display: flex;
              align-items: center;
              height: ${4 * GU}px;
              padding: 0 ${2 * GU}px;
              ${textStyle('label2')};
              color: ${theme.surfaceContentSecondary};
              border-bottom: 1px solid ${theme.border};
            `}
          >
            Ethereum connection
          </h1>
          <div
            css={`
              padding: ${3 * GU}px ${2 * GU}px;
            `}
          >
            <IdentityBadge entity={address} compact />
          </div>
        </section>
      </Popover>
    </a>
  )
}

ConnectedMode.propTypes = {
  locator: PropTypes.object.isRequired,
}

export default AccountModule
