from ranger.gui.colorscheme import ColorScheme
from ranger.gui.color import *

class ColorScheme(ColorScheme):

    def use(self, context):
        fg, bg, attr = default_colors

        if context.reset:
            return default_colors

        elif context.in_browser:
            if context.selected:
                attr = reverse
            else:
                attr = normal
            if context.empty or context.error:
                fg = 197 # error
                bg = 217
            if context.border:
                fg = white
            if context.image:
                fg = 110 # img
            if context.video:
                fg = 111 # vids
            if context.audio:
                fg = white
            if context.document:
                fg = 69 # docs
            if context.container:
                attr |= bold
                fg = 197
            if context.directory:
                attr |= bold
                fg = 117 # folders
            elif context.executable and not \
                    any((context.media, context.container,
                       context.fifo, context.socket)):
                attr |= bold
                fg = 211 # scripts
            if context.socket:
                fg = 245 # dbus file
                attr |= bold
            if context.fifo or context.device:
                fg = 245 # system devices and stuff like /dev/sda
                if context.device:
                    attr |= bold
            if context.link:
                fg = context.good and 209 or 197 # linked folders
            if context.bad:
                fg = 209
            if context.tag_marker and not context.selected:
                attr |= bold
                fg = 15 # stars
            if not context.selected and (context.cut or context.copied):
                attr = reverse
            if context.main_column:
                if context.selected:
                    attr |= bold
                if context.marked:
                    attr |= bold
                    fg = 114 # marked
            if context.badinfo:
                if attr & reverse:
                    bg = 197
                else:
                    fg = 197

        elif context.in_titlebar:
            attr |= bold
            if context.hostname:
                fg = context.bad and 197 or 117 # username
            elif context.directory:
                fg = 15 # slash
            elif context.tab:
                if context.good:
                    bg = 197

        elif context.in_statusbar:
            if context.permissions:
                if context.good:
                    fg = 111 # permissions, writable
                elif context.bad:
                    fg = 109 # permissions, not wriable
            if context.marked:
                attr |= bold | reverse
                fg = 197
            if context.message:
                if context.bad:
                    attr |= bold
                    fg = 197
            if context.loaded:
                bg = 111


        if context.text:
            if context.highlight:
                attr |= reverse

        if context.in_taskview:
            if context.title:
                fg = 197

            if context.selected:
                attr |= reverse

            if context.loaded:
                if context.selected:
                    fg = 197
                else:
                    bg = 197

        return fg, bg, attr
