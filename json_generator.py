import os
import json


def process_folder(path, holder):
    for file in os.listdir(path):
        target = os.path.join(path, file)
        if os.path.isdir(target):
            child = dict()
            child['name'] = file
            child['children'] = list()
            child['images'] = list()
            child['type'] = 'images'
            holder['type'] = 'folder'
            holder["children"].append(child)
            process_folder(target, child)
        elif os.path.splitext(file)[1] in {'.png', '.jpg'}:
            holder['images'].append(target)


values = dict()
values['name'] = 'Vehicles'
values['children'] = list()
values['images'] = list()
values['type'] = 'images'
process_folder('Vehicles', values)
json_object = json.dumps(values, indent=4)
with open('arf.json', 'w') as f:
    print(json_object, file=f)
