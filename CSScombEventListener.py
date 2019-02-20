import sublime, sublime_plugin

class CSScombEventListener(sublime_plugin.EventListener):
    @staticmethod
    def on_pre_save(view):
        if not CSScombEventListener.get_settings(view).get('on-save'):
            return

        view.window().run_command('css_comb')

    @staticmethod
    def get_settings(view):
        settings = view.settings().get('CSScomb')

        if settings is None:
            settings = sublime.load_settings('CSScomb.sublime-settings')

        return settings
