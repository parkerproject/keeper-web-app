import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { actions as documentsActions } from 'store/modules/documents'

import './BookmarkletView.scss'

export class BookmarkletView extends React.Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
    documents: PropTypes.object.isRequired,
    createDocument: PropTypes.func.isRequired
  };

  constructor (props) {
    super(props)
    this.receiveMessage = this.receiveMessage.bind(this)
    this.close = this.close.bind(this)
    this.messages = []
    this.state = {
      onDragOver: false,
      content: null,
      error: null,
      success: null,
      loading: false
    }
  }

  componentDidMount () {
    window.addEventListener('message', this.receiveMessage, false)
  }

  componentWillUnmount () {
    window.removeEventListener('message', this.receiveMessage)
  }

  sendMessageBack (message) {
    this.messages.push(message)
  }

  receiveMessage (event) {
    switch (event.data) {
      case 'ping':
        while (this.messages.length > 0) {
          var message = this.messages.shift()
          event.source.postMessage(message, event.origin)
        }
        break
      case 'onDragEnter':
        this.setState({onDragOver: true})
        break
      case 'onDragLeave':
        this.setState({onDragOver: false})
        break
      case 'onClick':
        this.submit()
        break
      default:
        this.setState({
          onDragOver: false,
          content: event.data,
          error: null,
          success: null
        })
    }
  }

  submitError () {
    this.setState({
      onDragOver: false,
      content: null,
      error: null,
      success: null,
      loading: false
    })
  }

  submitSuccess () {
    const { origin } = document.location
    const { current: doc } = this.props.documents
    window.open(`${origin}/document/${doc.id}`)
  }

  submitDoc () {
    this.setState({loading: true})

    const { createDocument, location } = this.props
    const doc = {
      title: location.query.title,
      origin: location.query.url
    }
    if (this.state.content) {
      doc.content = this.state.content
      doc.contentType = 'text/html'
    }
    createDocument(doc).then(() => {
      this.setState({
        loading: false,
        success: true,
        error: null,
        content: null
      })
    }, (err) => {
      this.setState({
        success: false,
        error: err,
        loading: false
      })
    })
  }

  submit () {
    const { success, error } = this.state
    if (error) {
      this.submitError()
    } else if (success) {
      this.submitSuccess()
    } else {
      this.submitDoc()
    }
  }

  close () {
    this.setState({loading: true})
    this.sendMessageBack('close')
  }

  get icon () {
    let icon = 'cloud upload'
    if (this.state.onDragOver) {
      icon = 'dropdown'
    } else if (this.state.error) {
      icon = 'warning sign'
    } else if (this.state.success) {
      icon = 'checkmark'
    }

    return (
      <i className={`${icon} icon`}></i>
    )
  }

  get color () {
    let color = 'transparent'
    if (this.state.onDragOver) {
      color = '#167AC6'
    } else if (this.state.error) {
      color = '#F51515'
    } else if (this.state.success) {
      color = '#21BA45'
    }
    return {
      backgroundColor: color
    }
  }

  get title () {
    let t = 'Send page to the Keeper'
    if (this.state.onDragOver) {
      t = 'Drop content on me'
    } else if (this.state.error) {
      t = 'Error!'
    } else if (this.state.success) {
      t = 'Kept! See the result?'
    } else if (this.state.content) {
      t = 'Send content to the Keeper'
    }
    return t
  }

  get dimmer () {
    if (this.state.loading) {
      return (
        <div className='ui active dimmer'>
          <div className='ui loader'></div>
        </div>
      )
    }
  }

  get dropZone () {
    return (
      <div className='dropzone' style={this.color}>
        <h3 className='ui icon header'>
          {this.icon}
          <div className='content'>{this.title}</div>
        </h3>
        {this.dimmer}
      </div>
    )
  }

  render () {
    return (
      <div className='bookmarklet'>
        <div className='ui top inverted borderless menu'>
          <div className='header item'>Keeper</div>
          <div className='right menu'>
            <a className='ui item' onClick={this.close}>
              <i className='remove icon' />
            </a>
          </div>
        </div>
        {this.dropZone}
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  location: state.router.locationBeforeTransitions,
  documents: state.documents
})

const mapDispatchToProps = (dispatch) => (
  bindActionCreators(Object.assign({}, documentsActions), dispatch)
)

export default connect(mapStateToProps, mapDispatchToProps)(BookmarkletView)
