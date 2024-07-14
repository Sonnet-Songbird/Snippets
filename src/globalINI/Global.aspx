<%@ Application Language="C#" %>
<%@ Import Namespace="System.Collections.Generic" %>
<%@ Import Namespace="System.Web" %>

<script runat="server">
    public static Dictionary<string, string> Config;

    void Application_Start(object sender, EventArgs e)
    {
        Config = new Dictionary<string, string>();
        string iniFilePath = Server.MapPath("~/App_Data/foo.ini");
        IniFile iniFile = new IniFile(iniFilePath);

        Config["barKey"] = iniFile.Read("fooSection", "fooKey");
    }

    // foo.ini
    // [fooSection]
    // fooKey=fooValue
</script>
