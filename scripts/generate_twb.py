import os

twb_content = """<?xml version='1.0' encoding='utf-8' ?>

<!-- Simple Tableau Workbook XML structure connecting to Superstore.csv -->
<workbook original-version='18.1' source-build='2023.2.0' version='18.1' xmlns:user='http://www.tableausoftware.com/xml/user'>
  <document-format-change-manifest>
    <AutoCreateAndUpdateDPMManifest />
    <MapboxVectorMapsAndLayers />
    <SharedWorkbooksManifest />
  </document-format-change-manifest>
  <preferences>
    <preference name='ui.theme' value='modern' />
  </preferences>
  <datasources>
    <datasource caption='Superstore (CSV)' inline='true' name='federated.superstore' version='18.1'>
      <connection class='federated'>
        <named-connections>
          <named-connection caption='Superstore' name='textscan.superstore'>
            <connection class='textscan' directory='../Dataset' filename='Superstore.csv' password='' server='' />
          </named-connection>
        </named-connections>
      </connection>
      <column datatype='integer' name='[Row ID]' role='dimension' type='ordinal' />
      <column datatype='string' name='[Category]' role='dimension' type='nominal' />
      <column datatype='string' name='[Sub-Category]' role='dimension' type='nominal' />
      <column datatype='string' name='[Segment]' role='dimension' type='nominal' />
      <column datatype='string' name='[Region]' role='dimension' type='nominal' />
      <column datatype='string' name='[State]' role='dimension' type='nominal' />
      <column datatype='real' name='[Sales]' role='measure' type='quantitative' />
      <column datatype='real' name='[Profit]' role='measure' type='quantitative' />
      <column datatype='real' name='[Discount]' role='measure' type='quantitative' />
      <column datatype='integer' name='[Quantity]' role='measure' type='quantitative' />
      <layout dim-ordering='alphabetical' measure-ordering='alphabetical' show-structure='true' />
    </datasource>
  </datasources>
  <worksheets>
    <worksheet name='Executive Overview'>
      <table>
        <view>
          <datasources>
            <datasource caption='Superstore (CSV)' name='federated.superstore' />
          </datasources>
          <datasource-dependencies datasource='federated.superstore'>
            <column datatype='string' name='[Category]' role='dimension' type='nominal' />
            <column datatype='real' name='[Sales]' role='measure' type='quantitative' />
            <column-instance column='[Category]' derivation='None' name='[none:Category:nk]' role='dimension' type='nominal' />
            <column-instance column='[Sales]' derivation='Sum' name='[sum:Sales:qk]' role='measure' type='quantitative' />
          </datasource-dependencies>
          <aggregation value='true' />
        </view>
        <style />
        <panes>
          <pane selection-relaxation-option='selection-relaxation-allow'>
            <view>
              <breakdown value='auto' />
            </view>
            <mark class='automatic' />
          </pane>
        </panes>
        <rows>[federated.superstore].[sum:Sales:qk]</rows>
        <cols>[federated.superstore].[none:Category:nk]</cols>
      </table>
      <simple-id uuid='{F3A9D98E-DBC3-4D9D-9F02-E3BAF2B56781}' />
    </worksheet>
  </worksheets>
  <dashboards>
    <dashboard name='Superstore Performance Storyboard'>
      <style />
      <size maxheight='800' maxwidth='1000' minheight='800' minwidth='1000' />
      <zones>
        <zone h='100000' id='1' type-name='layout-basic' w='100000' x='0' y='0'>
          <zone h='98000' id='2' name='Executive Overview' w='98000' x='1000' y='1000' />
        </zone>
      </zones>
    </dashboard>
  </dashboards>
  <windows>
    <window class='dashboard' maximized='true' name='Superstore Performance Storyboard'>
      <active id='-1' />
    </window>
  </windows>
</workbook>
"""

os.makedirs("Dashboard", exist_ok=True)
with open("Dashboard/Dashboard.twb", "w", encoding="utf-8") as f:
    f.write(twb_content)

print("Tableau Workbook generated successfully at Dashboard/Dashboard.twb!")
