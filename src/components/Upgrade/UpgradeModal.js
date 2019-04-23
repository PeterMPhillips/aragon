import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { ButtonIcon, Modal, Viewport } from '@aragon/ui'
import { useArrows, useSteps } from '../../hooks'
import { highlights } from './content'
import Navigation from './Navigation'
import HighlightScreen, { RATIO_LEFT } from './HighlightScreen'
import ProgressBar from './ProgressBar'

import closeSvg from './assets/close.svg'

const UpgradeModal = React.memo(({ visible, onUpgrade, onClose }) => {
  const steps = highlights.length
  const { step, next, prev, setStep } = useSteps(steps)

  // Keyboard navigation
  useArrows(visible ? { onLeft: prev, onRight: next } : {})

  useEffect(() => {
    if (visible) {
      setStep(0)
    }
  }, [visible])

  return (
    <Viewport>
      {({ width, height }) => {
        const verticalMode = width < 900
        const compactMode = width < 500 || height < 400
        return (
          <Modal
            padding={0}
            width={Math.min(1055, width - 40)}
            visible={visible}
            overlayColor="rgb(37, 49, 77, 0.75)"
            onClose={onClose}
          >
            <div
              css="position: relative"
              style={{
                height: verticalMode
                  ? `${height - 40}px`
                  : `${Math.max(500, Math.min(620, height - 40))}px`,
              }}
            >
              <ProgressBar value={(step + 1) / steps} />

              <ButtonIcon
                label="Close"
                onClick={onClose}
                css={`
                  position: absolute;
                  top: 17px;
                  right: 17px;
                  z-index: 1;
                `}
              >
                <img src={closeSvg} alt="" />
              </ButtonIcon>

              <div
                css={`
                  position: relative;
                  width: 100%;
                  height: 100%;
                  overflow: hidden;
                  display: flex;
                `}
              >
                <HighlightScreen
                  compactMode={compactMode}
                  onUpgrade={onUpgrade}
                  verticalMode={verticalMode}
                  {...highlights[step]}
                />
              </div>

              <div
                css="position: relative"
                style={{
                  width: verticalMode ? '100%' : `${RATIO_LEFT * 100}%`,
                }}
              >
                <Navigation
                  step={step}
                  steps={steps}
                  onPrev={prev}
                  onNext={next}
                />
              </div>
            </div>
          </Modal>
        )
      }}
    </Viewport>
  )
})

UpgradeModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onUpgrade: PropTypes.func.isRequired,
  visible: PropTypes.bool.isRequired,
}

export default UpgradeModal