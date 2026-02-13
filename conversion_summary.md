# CustomAlert Conversion Summary

## Completed Files:
1. ConversationInfoScreen.js - ✅ DONE
2. StarredMessagesScreen.js - ✅ DONE
3. ScheduledMessagesScreen.js - ✅ DONE

## Files to Convert (using same pattern):

### PinnedMessagesScreen.js
- Import: `import CustomAlert, { useCustomAlert } from '../../../components/CustomAlert';`
- Hook: `const { alert, AlertComponent } = useCustomAlert();`
- Convert Alert.alert at line 79, 93
- Add `{AlertComponent}` before `</LinearGradient>`

### ForwardMessageScreen.js
- Import: `import CustomAlert, { useCustomAlert } from '../../../components/CustomAlert';`
- Hook: `const { alert, AlertComponent } = useCustomAlert();`
- Convert Alert.alert at lines 105, 113
- Add `{AlertComponent}` before `</LinearGradient>`

### CreateGroupScreen.js
- Import: `import CustomAlert, { useCustomAlert } from '../../../components/CustomAlert';`
- Hook: `const { alert, AlertComponent } = useCustomAlert();`
- Convert Alert.alert at lines 105, 110, 134
- Add `{AlertComponent}` before `</LinearGradient>`

### BlockedUsersScreen.js
- Import: `import CustomAlert, { useCustomAlert } from '../../../components/CustomAlert';`
- Hook: `const { alert, AlertComponent } = useCustomAlert();`
- Convert Alert.alert at lines 70, 90
- Add `{AlertComponent}` before `</LinearGradient>`

### components/VoiceRecorder.js
- Import: `import CustomAlert, { useCustomAlert } from '../../../components/CustomAlert';`
- Hook: `const { alert, AlertComponent } = useCustomAlert();` (pass as prop)
- Convert Alert.alert at lines 146, 177
- Add `{AlertComponent}` in parent component

### components/SwipeableConversationItem.js
- Import: `import CustomAlert, { useCustomAlert } from '../../../components/CustomAlert';`
- Hook: `const { alert, AlertComponent } = useCustomAlert();` (pass as prop)
- Convert Alert.alert at line 146
- Add `{AlertComponent}` in parent component

### components/GroupSettingsSheet.js
- Import: `import CustomAlert, { useCustomAlert } from '../../../components/CustomAlert';`
- Hook: `const { alert, AlertComponent } = useCustomAlert();`
- Convert Alert.alert at lines 163, 183, 203
- Add `{AlertComponent}` before `</Modal>`

### components/ImageViewer.js
- Import: `import CustomAlert, { useCustomAlert } from '../../../components/CustomAlert';`
- Hook: `const { alert, AlertComponent } = useCustomAlert();`
- Convert Alert.alert at lines 198, 209, 212
- Add `{AlertComponent}` before `</Modal>`

## Conversion Pattern:
1. Remove `Alert` from react-native import
2. Add CustomAlert import with correct path depth
3. Add `const { alert, AlertComponent } = useCustomAlert();` hook
4. Replace `Alert.alert('Title', 'Message')` with `alert({ type, title, message, buttons })`
5. Add `{AlertComponent}` before closing tag
