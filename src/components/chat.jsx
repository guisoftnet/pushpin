import React from 'react'
import PropTypes from 'prop-types'
import ReactToggle from 'react-toggle'

import ContentTypes from '../content-types'
import Content from './content'
import { createDocumentLink } from '../share-link'

export default class Chat extends React.PureComponent {
  static propTypes = {
    docId: PropTypes.string.isRequired
  }

  static initializeDocument(chatDoc) {
    chatDoc.messages = []
  }

  constructor(props) {
    super(props)

    this.handle = null

    this.onScroll = this.onScroll.bind(this)
    this.onInput = this.onInput.bind(this)
    this.onKeyDown = this.onKeyDown.bind(this)

    this.state = { message: '', messages: null }
  }

  componentWillMount() {
    this.handle = window.hm.openHandle(this.props.docId)
    this.handle.onChange((chatDoc) => {
      this.setState({ messages: chatDoc.messages })
    })
  }

  render() {
    return (
      <div style={css.chatWrapper}>
        <div style={css.messageWrapper}>
          <div style={css.messages} onScroll={this.onScroll}>
            {(this.state.messages || []).map(this.renderMessage)}
          </div>
        </div>
        <div style={css.inputWrapper}>
          <input
            style={css.input}
            value={this.state.message}
            onKeyDown={this.onKeyDown}
            onInput={this.onInput}
            placeholder={'Enter your message...'}
          />
        </div>
      </div>
    )
  }

  renderMessage({ authorId, content }, idx, msgs) {
    const prev = msgs[idx - 1] || {}

    return (
      <div style={css.message} key={idx}>
        { prev.authorId === authorId
          ? null
          : <div style={css.avatar}>
              <Content url={createDocumentLink('mini-avatar', authorId)} />
            </div>
        }
        <div style={css.content}>{content}</div>
      </div>
    )
  }

  onScroll(e) {
    e.stopPropagation()
  }

  onInput(e) {
    this.setState({
      message: e.target.value
    })
  }

  onKeyDown(e) {
    e.stopPropagation()

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      this.handle.change((chatDoc) => {
        chatDoc.messages.push({
          authorId: window.selfId,
          content: this.state.message
        })
      })

      this.setState({
        message: ""
      })
    }
  }
}

class MiniAvatar extends React.PureComponent {
  static propTypes = {
    doc: PropTypes.shape({
      avatarDocId: PropTypes.string,
      name: PropTypes.string,
    }).isRequired
  }

  render() {
    let avatar
    if (this.props.doc.avatarDocId) {
      avatar = <Content url={createDocumentLink('image', this.props.doc.avatarDocId)} />
    } else {
      avatar = <img alt="avatar" src="../img/default-avatar.png" />
    }

    return (
        <div style={css.avatar} title={this.props.doc.name}>
            { avatar }
        </div>
    )
  }
}

const css = {
  chatWrapper: {
    display: 'flex',
    backgroundColor: 'white',
    width: '100%',
    overflow: 'auto'
  },
  messageWrapper: {
    padding: 12,
    position: 'relative',
    display: 'flex',
    flexDirection: 'column-reverse',
    overflowY: 'scroll',
    marginBottom: 49,
    flexGrow: 1,
  },
  messages: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    flexGrow: '1',
  },
  message: {

  },
  avatar: {

  },
  content: {

  },
  inputWrapper: {
    boxSizing: 'border-box',
    width: '100%',
    borderTop: '1px solid var(--colorInputGrey)',
    position: 'absolute',
    bottom: 0,
    backgroundColor: 'white',
    padding: 8,
  },
  input: {
    width: '100%'
  },
}

ContentTypes.register({
  component: MiniAvatar,
  type: 'mini-avatar',
  name: 'Mini Avatar',
  icon: 'user',
  unlisted: true,
})

ContentTypes.register({
  component: Chat,
  type: 'chat',
  name: 'Chat',
  icon: 'group',
})
