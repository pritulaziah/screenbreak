import { ReminderApp } from "./components/ReminderApp";
import { SettingsApp } from "./components/SettingsApp";
import { AppStateProvider } from "./lib/appState";

export default function App({ isReminder }: { isReminder: boolean }) {
  return (
    <AppStateProvider>
      {isReminder ? <ReminderApp /> : <SettingsApp />}
    </AppStateProvider>
  );
}
