#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os
import shutil


def searchFile(src_dir, ext_filters, result_list):
    if not os.path.exists(src_dir) or not os.path.isdir(src_dir):
        print('None exits folder or not a directory at all, for:', src_dir, 'and will be ignored!')
        return
    for file in os.listdir(src_dir):
        file = os.path.join(src_dir, file)
        if os.path.isfile(file) and os.path.splitext(file)[1] in ext_filters:
            result_list.append(file)
        elif os.path.isdir(file):
            searchFile(file, ext_filters, result_list)


def getSearchedFiles(src_dir, ext_filters):
    results = []
    searchFile(src_dir, ext_filters, results)
    print('Find %d files in %s directory!' % (len(results), src_dir))
    return results


def copySingleFile(src_file, dst_dir):
    if not os.path.exists(src_file):
        print('No such source file')
        return
    src_dir = os.path.split(src_file)[0] if os.path.isfile(src_file) else src_file
    src_dir = os.path.relpath(src_dir)
    dst_dir = os.path.join(dst_dir, src_dir)
    dst_dir = dst_dir.replace('..\\', '')  # for test!
    if not os.path.exists(dst_dir):
        os.makedirs(dst_dir)
    shutil.copy2(src_file, dst_dir)


def createGeneratedFolder():
    current_path = os.path.abspath('.')
    generate_path = os.path.join(current_path, 'temp')
    generate_path = os.path.join(generate_path, 'generated')
    if os.path.exists(generate_path):
        os.removedirs(generate_path)
        os.makedirs(generate_path)
    return generate_path


def getInputWorkDirectories():
    dirs = [r'D:\Documents\Netprojects\Liuqingwen\public\2019',
            r'D:\Documents\Netprojects\Liuqingwen\public\2018',
            r'D:\Documents\Netprojects\Liuqingwen\public\2017']
    use_default = input('Use default directories?(y/n):')
    if use_default not in ['n', 'no', 'NO', 'N']:
        return dirs

    path = input('Input the work directory(0 char to stop):')
    dirs = [path]
    while len(path) > 1:
        path = input('Input the work directory(0 char to stop):')
        dirs.append(path)

    return dirs


def getInputExtensions():
    extensions = ['.html', '.json', '.js', '.css', '.log']
    use_default = input('Use default extensions?(y/n):')
    if use_default not in ['n', 'no', 'NO', 'N']:
        return extensions

    ext = input('Input the extensions to select(more than one use space to split):')
    extensions = ['.' + e for e in ext.split(' ') if e != '']
    return extensions


def startWork():
    gene = createGeneratedFolder()
    dirs = getInputWorkDirectories()
    if len(dirs) == 0:
        return

    extensions = getInputExtensions()
    for d in dirs:
        files = getSearchedFiles(d, extensions)
        for f in files:
            copySingleFile(f, gene)


def work():
    print('starting......')
    startWork()
    input('done, enter to continue...')


if __name__ == '__main__':
    work()
