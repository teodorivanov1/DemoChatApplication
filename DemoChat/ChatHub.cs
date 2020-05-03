using Microsoft.AspNet.SignalR;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DemoChat
{
    public class ChatHub : Hub
    {
        static ICollection<UserDetail> users = new List<UserDetail>();
        static ICollection<string> messages = new List<string>();
       
        public void Connect(string nickname)
        {
            var connectionId = Context.ConnectionId;

            if (!users.Any(x => x.ConnectionId == connectionId))
            {
                users.Add(new UserDetail { ConnectionId = connectionId, Nickname = nickname });
                Clients.Caller.onConnected(users.Last(), users, messages);
                Clients.AllExcept(connectionId).onNewUserConnected(users.Last());
            }
        }

        public void SendMessageToAll(string userName, string message, byte activeTabIndex) =>
            Clients.All.messageReceived(userName, message, activeTabIndex);

        public override Task OnDisconnected()
        {
            var user = users.FirstOrDefault(x => x.ConnectionId == Context.ConnectionId);
            if (user != null)
            {
                users.Remove(user);
                Clients.All.onUserDisconnected(Context.ConnectionId, user.Nickname);
            }
            return base.OnDisconnected();
        }
    }
    
    public class UserDetail
    {
        public string ConnectionId { get; set; }
        public string Nickname { get; set; }
    }
}