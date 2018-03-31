<% for(var i=0; i<messages.length; i++) {%>
  <li class="user">
    <span><%= messages[i].name %></span>
    <span><%= messages[i].wins %></span>
    <span><%= messages[i].losses %></span>
    <span><%= messages[i].casinoBank %></span>
  </li>
  <% } %>
