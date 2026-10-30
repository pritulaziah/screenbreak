import { ReminderApp } from "./components/ReminderApp";
import { SettingsApp } from "./components/SettingsApp";
import { UpdateBanner } from "./components/UpdateBanner";
import { AppStateProvider } from "./lib/appState";
import { UpdateProvider } from "./lib/updater";

export default function App({ isReminder }: { isReminder: boolean }) {
  return (
    <AppStateProvider>
      {isReminder ? (
        <ReminderApp />
      ) : (
        <UpdateProvider>
          <SettingsApp />
          <UpdateBanner />
        </UpdateProvider>
      )}
    </AppStateProvider>
  );
}
