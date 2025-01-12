import React from 'react'
import { StyleSheet } from 'react-native'
import { Snackbar } from 'react-native-paper'

type ErrorMessageProps = {
  children: React.ReactNode
  visible: boolean
  onDismiss: () => void
  durationMs?: number
}

const styles = StyleSheet.create({
  snackbarWrapper: {
    position: 'absolute',
    top: 50,
  },
})

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  children,
  visible,
  onDismiss,
  durationMs = 3000,
}) => {
  return (
    <Snackbar
      visible={visible}
      onDismiss={onDismiss}
      duration={durationMs}
      wrapperStyle={styles.snackbarWrapper}
    >
      {children}
    </Snackbar>
  )
}

export default ErrorMessage
