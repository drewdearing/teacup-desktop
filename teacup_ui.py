#!/usr/bin/python3
# Taken from https://www.python-course.eu/tkinter_entry_widgets.php

from tkinter import *

fields = ('Challonge Username', 'API Key', 'Bracket Code')

class TeacupUI:

    def __init__(self):
       self.root = Tk()
       self.ents = makeform(root)
       root.bind('<Return>', (lambda event, e=ents: login(e)))
       text = Message(root, text="Initializing Teacup...", width=300)
       text.grid(row=3, column=0, sticky="nsew")
       b1 = Button(root, text='Login',
              command=(lambda e=ents: login(e)))
       b1.grid(row=4, column=0, sticky="nsew")
       root.grid_rowconfigure(3, weight=1)
       root.grid_columnconfigure(0, weight=1)
       root.title("Teacup - OBS Manager")
       root.geometry('600x200')
       root.mainloop()


    def makeform(self, root):
       entries = {}
       row_id = 0
       for field in fields:
          row = Frame(root)
          lab = Label(row, width=18, text=field+": ", anchor='w')
          ent = Entry(row)
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


def login(entries):
   data = {
        "user": entries["Challonge Username"].get(),
        "key": entries["API Key"].get(),
        "bracket": entries["Bracket Code"].get()
   }
   print(data)