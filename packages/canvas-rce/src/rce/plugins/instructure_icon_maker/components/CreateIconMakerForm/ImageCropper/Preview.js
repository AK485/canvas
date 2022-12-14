/*
 * Copyright (C) 2021 - present Instructure, Inc.
 *
 * This file is part of Canvas.
 *
 * Canvas is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License as published by the Free
 * Software Foundation, version 3 of the License.
 *
 * Canvas is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Affero General Public License along
 * with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import React, {useRef, useEffect} from 'react'
import PropTypes from 'prop-types'
import formatMessage from '../../../../../../format-message'
import {ImageCropperSettingsPropTypes} from './propTypes'
import {buildSvg} from './svg'
import {PREVIEW_WIDTH, PREVIEW_HEIGHT, BACKGROUND_SQUARE_SIZE} from './constants'
import {useMouseWheel} from './useMouseWheel'
import {useArrowKeys} from './useArrowKeys'
import checkerboardStyle from '../../../../shared/CheckerboardStyling'

/**
 * Remove the node contents and append the svg element.
 */
function replaceSvg(svg, node) {
  if (!node) return
  while (node.firstChild) {
    node.removeChild(node.lastChild)
  }
  node.appendChild(svg)
}

function getTransformValue({translateX, translateY, rotation, scaleRatio}) {
  const values = []
  if (translateX !== 0) values.push(`translateX(${translateX}px)`)
  if (translateY !== 0) values.push(`translateY(${translateY}px)`)
  if (rotation && rotation % 360 !== 0) values.push(`rotate(${rotation}deg)`)
  if (scaleRatio > 1) values.push(`scale(${scaleRatio})`)
  return values.join(' ')
}

export const Preview = ({settings, dispatch}) => {
  const shapeRef = useRef(null)
  const {image, shape, rotation, scaleRatio, translateX, translateY} = settings
  const [tempScaleRatio, onWheelCallback] = useMouseWheel(scaleRatio, dispatch)
  const [tempTranslateX, tempTranslateY] = useArrowKeys(translateX, translateY, dispatch)

  useEffect(() => {
    const svg = buildSvg(shape)
    replaceSvg(svg, shapeRef.current)
  })

  const transformValue = getTransformValue({
    translateX: tempTranslateX,
    translateY: tempTranslateY,
    rotation,
    scaleRatio: tempScaleRatio
  })

  return (
    <div
      id="cropper-preview"
      style={{
        position: 'relative',
        width: `${PREVIEW_WIDTH}px`,
        height: `${PREVIEW_HEIGHT}px`,
        top: 0,
        left: 0,
        overflow: 'hidden',
        ...checkerboardStyle(BACKGROUND_SQUARE_SIZE)
      }}
      onWheel={onWheelCallback}
    >
      <img
        src={image}
        alt={formatMessage('Image to crop')}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100%',
          width: '100%',
          objectFit: 'contain',
          textAlign: 'center',
          transform: transformValue
        }}
      />
      <div
        id="cropShapeContainer"
        style={{
          position: 'absolute',
          top: 0,
          left: 0
        }}
        ref={shapeRef}
      />
    </div>
  )
}

Preview.propTypes = {
  settings: ImageCropperSettingsPropTypes.isRequired,
  dispatch: PropTypes.func.isRequired
}
