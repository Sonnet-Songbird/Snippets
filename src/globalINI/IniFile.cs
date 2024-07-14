using System;
using System.Collections.Generic;
using System.IO;
using System.Runtime.InteropServices;
using System.Text;

public class IniFile
{
    public string Path { get; set; }

    [DllImport("kernel32", CharSet = CharSet.Unicode)]
    private static extern long WritePrivateProfileString(string section, string key, string val, string filePath);

    [DllImport("kernel32", CharSet = CharSet.Unicode)]
    private static extern int GetPrivateProfileString(string section, string key, string def, StringBuilder retVal, int size, string filePath);

    public IniFile(string path)
    {
        Path = path;
    }

    public string Read(string section, string key)
    {
        var retVal = new StringBuilder(255);
        GetPrivateProfileString(section, key, "", retVal, 255, Path);
        return retVal.ToString();
    }

    public void Write(string section, string key, string value)
    {
        WritePrivateProfileString(section, key, value, Path);
    }
}
