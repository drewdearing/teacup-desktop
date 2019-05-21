#!/usr/bin/python3
# Taken from https://www.python-course.eu/tkinter_entry_widgets.php
import sys, os
from tkinter import *

fields = ('Challonge Username', 'API Key', 'Bracket Code')
field_to_var = {
    'Challonge Username': "user",
    'API Key': "key",
    'Bracket Code': "bracket"
}

def resource_path(relative_path):
    if getattr(sys, 'frozen', False):
        # Uncomment line for Mac Path
        # application_path = os.path.abspath(os.path.dirname(sys.executable)+'/../../../')
        # Uncomment line for Windows / Linux
        application_path = sys._MEIPASS
    else:
        application_path = os.path.dirname(os.path.abspath(__file__))
    return os.path.join(application_path, relative_path)

def create_closing(root, processes):
    def close():
        root.destroy()
        processes["sio"].disconnect()
        processes["thread"].join()
    return close

class TeacupUI:

    def __init__(self):
       self.root = Tk()
       self.strVars = {
            "user": StringVar(),
            "key": StringVar(),
            "bracket": StringVar()
       }
       self.messageVar = StringVar()
       ents = self.makeform()
       self.onLogin = lambda e: print(e)
       self.root.bind('<Return>', (lambda event, e=ents: self.onLogin(e)))
       text = Message(self.root,
                      text="Initializing Teacup...",
                      width=300,
                      textvariable=self.messageVar)
       text.grid(row=3, column=0, sticky="nsew")
       b1 = Button(self.root, text='Login',
              command=(lambda e=ents: self.onLogin(e)))
       b1.grid(row=4, column=0, sticky="nsew")
       self.root.grid_rowconfigure(3, weight=1)
       self.root.grid_columnconfigure(0, weight=1)
       self.root.title("Teacup - Stream Manager")
       img = PhotoImage(file=resource_path("icon.png"))
       self.root.tk.call('wm','iconphoto', self.root._w, img)
       self.root.geometry('600x200')

    def makeform(self):
       entries = {}
       row_id = 0
       for field in fields:
          row = Frame(self.root)
          lab = Label(row, width=18, text=field+": ", anchor='w')
          ent = Entry(row, textvariable=self.strVars[field_to_var[field]])
          ent.insert(0,"")
          row.grid(row=row_id, column=0, sticky="nsew")
          #row.pack(side=TOP, fill=X, padx=5, pady=5)
          lab.grid(row=0, column=0, sticky="nsew")
          #lab.pack(side=LEFT)
          ent.grid(row=0, column=1, sticky="nsew")
          #ent.pack(side=RIGHT, expand=YES, fill=X) 
          row.grid_rowconfigure(0, weight=1)
          row.grid_columnconfigure(1, weight=1)
          entries[field] = ent
          row_id += 1
       return entries

    def start(self):
        self.root.mainloop()

    def setOnLogin(self, fn):
        self.onLogin = fn

    def setFormText(self, data):
        for var, text in data.items():
            self.strVars[var].set(text)

    def setMessage(self, msg):
        self.messageVar.set(msg)

    def setCleanup(self, processes):
        self.root.protocol("WM_DELETE_WINDOW",
                          create_closing(self.root, processes))
